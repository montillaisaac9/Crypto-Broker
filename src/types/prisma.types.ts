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
// Si hay problemas con la importación, usar los enums explícitos como respaldo
export { 
  OrderType,
  OrderSide,
  OrderStatus
} from '@prisma/client';

// Enums explícitos como respaldo para evitar problemas de runtime
export { 
  OrderType as OrderTypeExplicit,
  OrderSide as OrderSideExplicit,
  OrderStatus as OrderStatusExplicit
} from './enums';
