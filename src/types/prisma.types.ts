// Tipos para Prisma - reexportar desde el cliente generado
export type { 
  User, 
  Balance, 
  Holding, 
  Order, 
  Trade,
  Prisma 
} from '@prisma/client';

// Reexportar enums directamente desde el cliente generado
// Si hay problemas con la importación, usar la ruta directa al archivo generado
export { 
  OrderType,
  OrderSide,
  OrderStatus
} from '@prisma/client';
