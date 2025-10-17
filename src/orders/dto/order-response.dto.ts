import { ApiProperty } from '@nestjs/swagger';
import { OrderType, OrderSide, OrderStatus, OrderTypeExplicit, OrderSideExplicit, OrderStatusExplicit } from '../../types/prisma.types';

// Usar enums explícitos como respaldo para evitar problemas de runtime
const OrderTypeEnum = OrderType || OrderTypeExplicit;
const OrderSideEnum = OrderSide || OrderSideExplicit;
const OrderStatusEnum = OrderStatus || OrderStatusExplicit;

export class OrderResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'BTCUSDT' })
  symbol: string;

  @ApiProperty({ enum: OrderTypeEnum, example: OrderTypeEnum.MARKET })
  type: OrderType;

  @ApiProperty({ enum: OrderSideEnum, example: OrderSideEnum.BUY })
  side: OrderSide;

  @ApiProperty({ example: 0.001 })
  quantity: number;

  @ApiProperty({ example: 45000, nullable: true })
  price: number | null;

  @ApiProperty({ enum: OrderStatusEnum, example: OrderStatusEnum.PENDING })
  status: OrderStatus;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  created_at: Date;

  @ApiProperty({ example: '2024-01-15T10:30:05Z', nullable: true })
  filled_at: Date | null;
}
