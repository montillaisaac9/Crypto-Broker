import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('websocket')
@Controller('websocket')
export class WebsocketDocsController {
  
  @Get('info')
  @ApiOperation({ 
    summary: 'Información sobre WebSockets disponibles',
    description: 'Obtiene información sobre los WebSockets disponibles en la aplicación'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Información de WebSockets',
    schema: {
      type: 'object',
      properties: {
        chart: {
          type: 'object',
          properties: {
            namespace: { type: 'string', example: '/chart' },
            url: { type: 'string', example: 'ws://localhost:3000/chart' },
            description: { type: 'string', example: 'WebSocket para datos de velas japonesas en tiempo real' },
            events: {
              type: 'object',
              properties: {
                client: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      event: { type: 'string' },
                      description: { type: 'string' },
                      payload: { type: 'object' }
                    }
                  }
                },
                server: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      event: { type: 'string' },
                      description: { type: 'string' },
                      payload: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  getWebsocketInfo() {
    return {
      chart: {
        namespace: '/chart',
        url: 'ws://localhost:3000/chart',
        description: 'WebSocket para datos de velas japonesas en tiempo real',
        events: {
          client: [
            {
              event: 'subscribe_chart',
              description: 'Suscribirse a un chart específico',
              payload: {
                symbol: 'string (ej: BTCUSDT)',
                interval: 'string (ej: 1m, 5m, 1h, 1d)'
              }
            },
            {
              event: 'unsubscribe_chart',
              description: 'Desuscribirse de un chart',
              payload: {
                symbol: 'string (ej: BTCUSDT)',
                interval: 'string (ej: 1m, 5m, 1h, 1d)'
              }
            },
            {
              event: 'get_subscriptions',
              description: 'Obtener suscripciones activas del cliente',
              payload: {}
            },
            {
              event: 'get_active_streams',
              description: 'Obtener streams activos del servidor',
              payload: {}
            }
          ],
          server: [
            {
              event: 'historical_data',
              description: 'Datos históricos al suscribirse',
              payload: {
                symbol: 'string',
                interval: 'string',
                data: 'array de velas japonesas'
              }
            },
            {
              event: 'subscription_confirmed',
              description: 'Confirmación de suscripción exitosa',
              payload: {
                message: 'string',
                symbol: 'string',
                interval: 'string',
                historicalCount: 'number'
              }
            },
            {
              event: 'candlestick_update',
              description: 'Actualización de vela en tiempo real',
              payload: {
                symbol: 'string',
                interval: 'string',
                openTime: 'number',
                closeTime: 'number',
                open: 'number',
                high: 'number',
                low: 'number',
                close: 'number',
                volume: 'number',
                isClosed: 'boolean'
              }
            },
            {
              event: 'subscription_error',
              description: 'Error en la suscripción',
              payload: {
                message: 'string',
                symbol: 'string',
                interval: 'string'
              }
            },
            {
              event: 'unsubscription_confirmed',
              description: 'Confirmación de desuscripción',
              payload: {
                message: 'string',
                symbol: 'string',
                interval: 'string'
              }
            },
            {
              event: 'unsubscription_error',
              description: 'Error en la desuscripción',
              payload: {
                message: 'string',
                symbol: 'string',
                interval: 'string'
              }
            },
            {
              event: 'client_subscriptions',
              description: 'Respuesta con suscripciones del cliente',
              payload: {
                clientId: 'string',
                subscriptions: 'array de objetos {symbol, interval}',
                count: 'number'
              }
            },
            {
              event: 'active_streams',
              description: 'Respuesta con streams activos',
              payload: {
                streams: 'array de objetos {symbol, interval, subscriberCount}',
                totalStreams: 'number',
                totalSubscribers: 'number'
              }
            }
          ]
        },
        supportedSymbols: [
          'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT',
          'XRPUSDT', 'DOTUSDT', 'MATICUSDT', 'LINKUSDT'
        ],
        supportedIntervals: [
          '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'
        ]
      }
    };
  }

  @Get('examples')
  @ApiOperation({ 
    summary: 'Ejemplos de uso de WebSockets',
    description: 'Proporciona ejemplos de código para usar los WebSockets'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ejemplos de código para WebSockets',
    schema: {
      type: 'object',
      properties: {
        javascript: {
          type: 'object',
          properties: {
            connection: { type: 'string' },
            subscribe: { type: 'string' },
            unsubscribe: { type: 'string' },
            listen: { type: 'string' }
          }
        },
        python: {
          type: 'object',
          properties: {
            connection: { type: 'string' },
            subscribe: { type: 'string' },
            listen: { type: 'string' }
          }
        }
      }
    }
  })
  getWebsocketExamples() {
    return {
      javascript: {
        connection: `
// Conectar al WebSocket
const socket = io('ws://localhost:3000/chart');

socket.on('connect', () => {
  console.log('Conectado al WebSocket');
});
        `,
        subscribe: `
// Suscribirse a un chart
socket.emit('subscribe_chart', {
  symbol: 'BTCUSDT',
  interval: '1m'
});
        `,
        unsubscribe: `
// Desuscribirse de un chart
socket.emit('unsubscribe_chart', {
  symbol: 'BTCUSDT',
  interval: '1m'
});
        `,
        listen: `
// Escuchar eventos
socket.on('historical_data', (data) => {
  console.log('Datos históricos:', data);
});

socket.on('candlestick_update', (candlestick) => {
  console.log('Nueva vela:', candlestick);
});

socket.on('subscription_confirmed', (confirmation) => {
  console.log('Suscripción confirmada:', confirmation);
});
        `
      },
      python: {
        connection: `
import socketio

sio = socketio.Client()

@sio.event
def connect():
    print('Conectado al WebSocket')

sio.connect('ws://localhost:3000/chart')
        `,
        subscribe: `
# Suscribirse a un chart
sio.emit('subscribe_chart', {
    'symbol': 'BTCUSDT',
    'interval': '1m'
})
        `,
        listen: `
@sio.event
def historical_data(data):
    print('Datos históricos:', data)

@sio.event
def candlestick_update(candlestick):
    print('Nueva vela:', candlestick)
        `
      }
    };
  }
}
