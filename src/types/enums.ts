// Enums explícitos para evitar problemas de importación en tiempo de ejecución
export const OrderType = {
  MARKET: 'MARKET',
  LIMIT: 'LIMIT',
  STOP_LOSS: 'STOP_LOSS'
} as const;

export const OrderSide = {
  BUY: 'BUY',
  SELL: 'SELL'
} as const;

export const OrderStatus = {
  PENDING: 'PENDING',
  FILLED: 'FILLED',
  CANCELLED: 'CANCELLED'
} as const;

// Tipos TypeScript para los enums
export type OrderType = typeof OrderType[keyof typeof OrderType];
export type OrderSide = typeof OrderSide[keyof typeof OrderSide];
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
