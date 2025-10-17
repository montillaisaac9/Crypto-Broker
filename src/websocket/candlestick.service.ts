import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import WebSocket from 'ws';
import { CandlestickDto, BinanceInterval } from './dto/candlestick.dto';

interface BinanceKlineData {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  k: {
    t: number; // Kline start time
    T: number; // Kline close time
    s: string; // Symbol
    i: string; // Interval
    f: number; // First trade ID
    L: number; // Last trade ID
    o: string; // Open price
    c: string; // Close price
    h: string; // High price
    l: string; // Low price
    v: string; // Base asset volume
    n: number; // Number of trades
    x: boolean; // Is this kline closed?
    q: string; // Quote asset volume
    V: string; // Taker buy base asset volume
    Q: string; // Taker buy quote asset volume
    B: string; // Ignore
  };
}

interface Subscription {
  symbol: string;
  interval: BinanceInterval;
  ws: WebSocket;
  subscribers: Set<string>; // Client IDs
}

@Injectable()
export class CandlestickService {
  private readonly logger = new Logger(CandlestickService.name);
  private readonly binanceApiUrl = process.env.BINANCE_API_URL || 'https://api.binance.com/api/v3';
  private readonly binanceWsUrl = 'wss://stream.binance.com:9443/ws';
  
  private subscriptions = new Map<string, Subscription>();
  private readonly supportedSymbols = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT',
    'XRPUSDT', 'DOTUSDT', 'MATICUSDT', 'LINKUSDT'
  ];

  /**
   * Obtiene el histórico de velas desde Binance REST API
   */
  async getHistoricalCandlesticks(
    symbol: string, 
    interval: BinanceInterval, 
    limit: number = 500
  ): Promise<CandlestickDto[]> {
    try {
      if (!this.supportedSymbols.includes(symbol.toUpperCase())) {
        throw new Error(`Símbolo ${symbol} no soportado`);
      }

      const response = await axios.get(`${this.binanceApiUrl}/klines`, {
        params: {
          symbol: symbol.toUpperCase(),
          interval,
          limit
        }
      });

      return response.data.map((kline: any[]) => this.mapKlineToCandlestick(kline, symbol, interval));
    } catch (error) {
      this.logger.error(`Error obteniendo histórico para ${symbol} ${interval}:`, error.message);
      throw new Error(`Error al obtener histórico de velas para ${symbol}`);
    }
  }

  /**
   * Suscribe a un stream de velas en tiempo real
   */
  subscribeToCandlestickStream(
    symbol: string, 
    interval: BinanceInterval, 
    clientId: string,
    onCandlestickUpdate: (candlestick: CandlestickDto) => void
  ): void {
    const subscriptionKey = `${symbol.toLowerCase()}@kline_${interval}`;
    
    if (!this.supportedSymbols.includes(symbol.toUpperCase())) {
      throw new Error(`Símbolo ${symbol} no soportado`);
    }

    // Si ya existe la suscripción, solo agregar el cliente
    if (this.subscriptions.has(subscriptionKey)) {
      const subscription = this.subscriptions.get(subscriptionKey)!;
      subscription.subscribers.add(clientId);
      this.logger.log(`Cliente ${clientId} agregado a suscripción existente: ${subscriptionKey}`);
      return;
    }

    // Crear nueva suscripción
    const wsUrl = `${this.binanceWsUrl}/${subscriptionKey}`;
    const ws = new WebSocket(wsUrl);

    const subscription: Subscription = {
      symbol: symbol.toUpperCase(),
      interval,
      ws,
      subscribers: new Set([clientId])
    };

    ws.on('open', () => {
      this.logger.log(`WebSocket conectado para ${subscriptionKey}`);
    });

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const klineData: BinanceKlineData = JSON.parse(data.toString());
        const candlestick = this.mapBinanceKlineToCandlestick(klineData);
        
        // Enviar a todos los suscriptores
        subscription.subscribers.forEach(subscriberId => {
          onCandlestickUpdate(candlestick);
        });
      } catch (error) {
        this.logger.error(`Error procesando mensaje WebSocket para ${subscriptionKey}:`, error.message);
      }
    });

    ws.on('error', (error) => {
      this.logger.error(`Error en WebSocket para ${subscriptionKey}:`, error.message);
    });

    ws.on('close', () => {
      this.logger.log(`WebSocket cerrado para ${subscriptionKey}`);
      this.subscriptions.delete(subscriptionKey);
    });

    this.subscriptions.set(subscriptionKey, subscription);
    this.logger.log(`Nueva suscripción creada para ${subscriptionKey} con cliente ${clientId}`);
  }

  /**
   * Desuscribe a un cliente de un stream específico
   */
  unsubscribeFromCandlestickStream(
    symbol: string, 
    interval: BinanceInterval, 
    clientId: string
  ): void {
    const subscriptionKey = `${symbol.toLowerCase()}@kline_${interval}`;
    const subscription = this.subscriptions.get(subscriptionKey);

    if (!subscription) {
      this.logger.warn(`No se encontró suscripción para ${subscriptionKey}`);
      return;
    }

    subscription.subscribers.delete(clientId);
    this.logger.log(`Cliente ${clientId} removido de suscripción ${subscriptionKey}`);

    // Si no hay más suscriptores, cerrar la conexión WebSocket
    if (subscription.subscribers.size === 0) {
      subscription.ws.close();
      this.subscriptions.delete(subscriptionKey);
      this.logger.log(`Conexión WebSocket cerrada para ${subscriptionKey} - sin suscriptores`);
    }
  }

  /**
   * Desuscribe a un cliente de todas las suscripciones
   */
  unsubscribeClientFromAll(clientId: string): void {
    const subscriptionsToRemove: string[] = [];

    this.subscriptions.forEach((subscription, key) => {
      if (subscription.subscribers.has(clientId)) {
        subscription.subscribers.delete(clientId);
        
        if (subscription.subscribers.size === 0) {
          subscriptionsToRemove.push(key);
        }
      }
    });

    // Cerrar conexiones sin suscriptores
    subscriptionsToRemove.forEach(key => {
      const subscription = this.subscriptions.get(key);
      if (subscription) {
        subscription.ws.close();
        this.subscriptions.delete(key);
        this.logger.log(`Conexión WebSocket cerrada para ${key} - cliente ${clientId} desconectado`);
      }
    });
  }

  /**
   * Obtiene información de todas las suscripciones activas
   */
  getActiveSubscriptions(): Array<{ symbol: string; interval: string; subscriberCount: number; isActive: boolean }> {
    return Array.from(this.subscriptions.entries()).map(([key, subscription]) => ({
      symbol: subscription.symbol,
      interval: subscription.interval,
      subscriberCount: subscription.subscribers.size,
      isActive: subscription.ws.readyState === WebSocket.OPEN
    }));
  }

  /**
   * Mapea datos de kline de Binance REST API a CandlestickDto
   */
  private mapKlineToCandlestick(kline: any[], symbol: string, interval: BinanceInterval): CandlestickDto {
    return {
      symbol: symbol.toUpperCase(),
      interval,
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
      openTime: new Date(kline[0]).toISOString(),
      closeTime: new Date(kline[6]).toISOString(),
      isClosed: true // Los datos históricos siempre están cerrados
    };
  }

  /**
   * Mapea datos de kline de Binance WebSocket a CandlestickDto
   */
  private mapBinanceKlineToCandlestick(klineData: BinanceKlineData): CandlestickDto {
    const k = klineData.k;
    return {
      symbol: k.s,
      interval: k.i,
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c),
      volume: parseFloat(k.v),
      openTime: new Date(k.t).toISOString(),
      closeTime: new Date(k.T).toISOString(),
      isClosed: k.x
    };
  }

  /**
   * Cierra todas las conexiones WebSocket
   */
  onModuleDestroy(): void {
    this.subscriptions.forEach((subscription, key) => {
      subscription.ws.close();
      this.logger.log(`Conexión WebSocket cerrada para ${key}`);
    });
    this.subscriptions.clear();
  }
}
