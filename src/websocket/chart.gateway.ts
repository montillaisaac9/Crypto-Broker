import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { CandlestickService } from './candlestick.service';
import { SubscribeToChartDto, UnsubscribeFromChartDto } from './dto/subscription.dto';
import { CandlestickDto } from './dto/candlestick.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: '*', // En producción, especificar dominios permitidos
    methods: ['GET', 'POST'],
  },
  namespace: '/chart',
})
export class ChartGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChartGateway.name);
  private clientSubscriptions = new Map<string, Set<string>>(); // clientId -> Set<subscriptionKey>

  constructor(private readonly candlestickService: CandlestickService) {}

  async handleConnection(client: Socket) {
    const clientId = client.id;
    this.logger.log(`Cliente conectado: ${clientId}`);
    
    // Inicializar suscripciones del cliente
    this.clientSubscriptions.set(clientId, new Set());
    
    // Enviar confirmación de conexión
    client.emit('connected', {
      clientId,
      message: 'Conectado al servidor de velas japonesas',
      timestamp: new Date().toISOString()
    });
  }

  async handleDisconnect(client: Socket) {
    const clientId = client.id;
    this.logger.log(`Cliente desconectado: ${clientId}`);
    
    // Desuscribir de todas las suscripciones
    this.candlestickService.unsubscribeClientFromAll(clientId);
    
    // Limpiar suscripciones del cliente
    this.clientSubscriptions.delete(clientId);
  }

  @SubscribeMessage('subscribe_chart')
  async handleSubscribeChart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SubscribeToChartDto
  ) {
    const clientId = client.id;
    const subscriptionKey = `${data.symbol.toLowerCase()}@kline_${data.interval}`;
    
    try {
      this.logger.log(`Cliente ${clientId} solicitando suscripción a ${data.symbol} ${data.interval}`);

      // Verificar si el cliente ya está suscrito
      const clientSubs = this.clientSubscriptions.get(clientId);
      if (clientSubs && clientSubs.has(subscriptionKey)) {
        client.emit('subscription_error', {
          message: `Ya estás suscrito a ${data.symbol} ${data.interval}`,
          symbol: data.symbol,
          interval: data.interval
        });
        return;
      }

      // Obtener histórico inicial
      const historicalData = await this.candlestickService.getHistoricalCandlesticks(
        data.symbol,
        data.interval,
        100 // Últimas 100 velas
      );

      // Enviar histórico al cliente
      client.emit('historical_data', {
        symbol: data.symbol,
        interval: data.interval,
        data: historicalData
      });

      // Suscribir a stream en tiempo real
      this.candlestickService.subscribeToCandlestickStream(
        data.symbol,
        data.interval,
        clientId,
        (candlestick: CandlestickDto) => {
          client.emit('candlestick_update', candlestick);
        }
      );

      // Registrar suscripción del cliente
      if (!clientSubs) {
        this.clientSubscriptions.set(clientId, new Set());
      }
      this.clientSubscriptions.get(clientId)!.add(subscriptionKey);

      // Confirmar suscripción
      client.emit('subscription_confirmed', {
        message: `Suscrito exitosamente a ${data.symbol} ${data.interval}`,
        symbol: data.symbol,
        interval: data.interval,
        historicalCount: historicalData.length
      });

      this.logger.log(`Cliente ${clientId} suscrito exitosamente a ${data.symbol} ${data.interval}`);

    } catch (error) {
      this.logger.error(`Error en suscripción para cliente ${clientId}:`, error.message);
      client.emit('subscription_error', {
        message: error.message || 'Error al suscribirse al chart',
        symbol: data.symbol,
        interval: data.interval
      });
    }
  }

  @SubscribeMessage('unsubscribe_chart')
  async handleUnsubscribeChart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UnsubscribeFromChartDto
  ) {
    const clientId = client.id;
    const subscriptionKey = `${data.symbol.toLowerCase()}@kline_${data.interval}`;
    
    try {
      this.logger.log(`Cliente ${clientId} cancelando suscripción a ${data.symbol} ${data.interval}`);

      // Verificar si el cliente está suscrito
      const clientSubs = this.clientSubscriptions.get(clientId);
      if (!clientSubs || !clientSubs.has(subscriptionKey)) {
        client.emit('unsubscription_error', {
          message: `No estás suscrito a ${data.symbol} ${data.interval}`,
          symbol: data.symbol,
          interval: data.interval
        });
        return;
      }

      // Desuscribir del servicio
      this.candlestickService.unsubscribeFromCandlestickStream(
        data.symbol,
        data.interval,
        clientId
      );

      // Remover de suscripciones del cliente
      clientSubs.delete(subscriptionKey);

      // Confirmar desuscripción
      client.emit('unsubscription_confirmed', {
        message: `Desuscrito exitosamente de ${data.symbol} ${data.interval}`,
        symbol: data.symbol,
        interval: data.interval
      });

      this.logger.log(`Cliente ${clientId} desuscrito exitosamente de ${data.symbol} ${data.interval}`);

    } catch (error) {
      this.logger.error(`Error en desuscripción para cliente ${clientId}:`, error.message);
      client.emit('unsubscription_error', {
        message: error.message || 'Error al desuscribirse del chart',
        symbol: data.symbol,
        interval: data.interval
      });
    }
  }

  @SubscribeMessage('get_subscriptions')
  async handleGetSubscriptions(@ConnectedSocket() client: Socket) {
    const clientId = client.id;
    const clientSubs = this.clientSubscriptions.get(clientId);
    
    const subscriptions = clientSubs ? Array.from(clientSubs).map(key => {
      const [symbol, interval] = key.split('@kline_');
      return { symbol: symbol.toUpperCase(), interval };
    }) : [];

    client.emit('subscriptions_list', {
      clientId,
      subscriptions,
      count: subscriptions.length
    });
  }

  @SubscribeMessage('get_active_streams')
  async handleGetActiveStreams(@ConnectedSocket() client: Socket) {
    try {
      const activeStreams = this.candlestickService.getActiveSubscriptions();
      
      client.emit('active_streams', {
        streams: activeStreams,
        totalStreams: activeStreams.length,
        totalSubscribers: activeStreams.reduce((sum, stream) => sum + stream.subscriberCount, 0)
      });
    } catch (error) {
      this.logger.error('Error obteniendo streams activos:', error.message);
      client.emit('error', {
        message: 'Error al obtener streams activos'
      });
    }
  }

  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', {
      timestamp: new Date().toISOString(),
      clientId: client.id
    });
  }
}
