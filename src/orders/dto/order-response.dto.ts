import { ApiProperty } from '@nestjs/swagger';
import { OrderType, OrderSide, OrderStatus } from '../../entities/order.entity';

export class OrderResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'BTCUSDT' })
  symbol: string;

  @ApiProperty({ enum: OrderType, example: OrderType.MARKET })
  type: OrderType;

  @ApiProperty({ enum: OrderSide, example: OrderSide.BUY })
  side: OrderSide;

  @ApiProperty({ example: 0.001 })
  quantity: number;

  @ApiProperty({ example: 45000, nullable: true })
  price: number | null;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  created_at: Date;

  @ApiProperty({ example: '2024-01-15T10:30:05Z', nullable: true })
  filled_at: Date | null;
}
