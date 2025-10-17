// Tipos para Prisma - reexportar desde el cliente generado
export type { 
  User, 
  Balance, 
  Holding, 
  Order, 
  Trade,
  Prisma 
} from '@prisma/client';

// Exportar enums como valores para usar en decoradores
export { 
  OrderType,
  OrderSide,
  OrderStatus
} from '@prisma/client';
