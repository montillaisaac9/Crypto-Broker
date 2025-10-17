# WebSocket de Velas Japonesas

Este módulo implementa un sistema de transmisión en tiempo real de velas japonesas (candlesticks) usando WebSockets, consumiendo datos de la API de Binance.

## Características

- ✅ Transmisión en tiempo real de velas japonesas
- ✅ Soporte para 15 temporalidades estándar
- ✅ 9 símbolos de criptomonedas predefinidos
- ✅ Histórico inicial al suscribirse
- ✅ Gestión automática de conexiones
- ✅ Múltiples clientes por suscripción

## Temporalidades Soportadas

- `1m` - 1 minuto
- `3m` - 3 minutos
- `5m` - 5 minutos
- `15m` - 15 minutos
- `30m` - 30 minutos
- `1h` - 1 hora
- `2h` - 2 horas
- `4h` - 4 horas
- `6h` - 6 horas
- `8h` - 8 horas
- `12h` - 12 horas
- `1d` - 1 día
- `3d` - 3 días
- `1w` - 1 semana
- `1M` - 1 mes

## Símbolos Soportados

- BTCUSDT
- ETHUSDT
- BNBUSDT
- SOLUSDT
- ADAUSDT
- XRPUSDT
- DOTUSDT
- MATICUSDT
- LINKUSDT

## Conexión WebSocket

**URL**: `ws://localhost:3000/chart`

## Eventos del Cliente

### 1. Suscribirse a un Chart

```javascript
socket.emit('subscribe_chart', {
  symbol: 'BTCUSDT',
  interval: '1m'
});
```

**Respuestas**:
- `historical_data`: Datos históricos (últimas 100 velas)
- `subscription_confirmed`: Confirmación de suscripción
- `candlestick_update`: Actualizaciones en tiempo real
- `subscription_error`: Error en la suscripción

### 2. Desuscribirse de un Chart

```javascript
socket.emit('unsubscribe_chart', {
  symbol: 'BTCUSDT',
  interval: '1m'
});
```

**Respuestas**:
- `unsubscription_confirmed`: Confirmación de desuscripción
- `unsubscription_error`: Error en la desuscripción

### 3. Obtener Suscripciones del Cliente

```javascript
socket.emit('get_subscriptions');
```

**Respuesta**:
```javascript
{
  clientId: "socket_id",
  subscriptions: [
    { symbol: "BTCUSDT", interval: "1m" },
    { symbol: "ETHUSDT", interval: "5m" }
  ],
  count: 2
}
```

### 4. Obtener Streams Activos

```javascript
socket.emit('get_active_streams');
```

**Respuesta**:
```javascript
{
  streams: [
    {
      symbol: "BTCUSDT",
      interval: "1m",
      subscriberCount: 3,
      isActive: true
    }
  ],
  totalStreams: 1,
  totalSubscribers: 3
}
```

### 5. Ping/Pong

```javascript
socket.emit('ping');
```

**Respuesta**:
```javascript
{
  timestamp: "2024-01-15T10:30:00.000Z",
  clientId: "socket_id"
}
```

## Eventos del Servidor

### Conexión

```javascript
socket.on('connected', (data) => {
  console.log('Conectado:', data);
  // { clientId: "socket_id", message: "Conectado al servidor de velas japonesas", timestamp: "..." }
});
```

### Datos Históricos

```javascript
socket.on('historical_data', (data) => {
  console.log('Datos históricos:', data);
  // { symbol: "BTCUSDT", interval: "1m", data: [...] }
});
```

### Actualizaciones en Tiempo Real

```javascript
socket.on('candlestick_update', (candlestick) => {
  console.log('Nueva vela:', candlestick);
  // {
  //   symbol: "BTCUSDT",
  //   interval: "1m",
  //   open: 45000.50,
  //   high: 46000.75,
  //   low: 44500.25,
  //   close: 45500.00,
  //   volume: 1234.567,
  //   openTime: "2024-01-15T10:30:00.000Z",
  //   closeTime: "2024-01-15T10:31:00.000Z",
  //   isClosed: false
  // }
});
```

## Ejemplo de Uso Completo

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/chart');

// Conectar
socket.on('connected', (data) => {
  console.log('Conectado:', data);
  
  // Suscribirse a BTCUSDT 1m
  socket.emit('subscribe_chart', {
    symbol: 'BTCUSDT',
    interval: '1m'
  });
});

// Recibir datos históricos
socket.on('historical_data', (data) => {
  console.log(`Histórico para ${data.symbol} ${data.interval}:`, data.data);
});

// Recibir actualizaciones en tiempo real
socket.on('candlestick_update', (candlestick) => {
  console.log('Nueva vela:', candlestick);
  
  // Actualizar gráfico
  updateChart(candlestick);
});

// Confirmación de suscripción
socket.on('subscription_confirmed', (data) => {
  console.log('Suscrito:', data);
});

// Manejar errores
socket.on('subscription_error', (error) => {
  console.error('Error:', error);
});

// Desconectar
socket.on('disconnect', () => {
  console.log('Desconectado del servidor');
});
```

## Notas Técnicas

- El servidor gestiona automáticamente las conexiones WebSocket con Binance
- Se reutilizan las conexiones para múltiples clientes
- Las conexiones se cierran automáticamente cuando no hay suscriptores
- Los datos históricos se obtienen al momento de la suscripción
- Las actualizaciones en tiempo real incluyen velas abiertas y cerradas
