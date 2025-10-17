import { IsString, IsNumber, Min, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderType, OrderSide, OrderTypeExplicit, OrderSideExplicit } from '../../types/prisma.types';

// Usar enums explícitos como respaldo para evitar problemas de runtime
const OrderTypeEnum = OrderType || OrderTypeExplicit;
const OrderSideEnum = OrderSide || OrderSideExplicit;

export class CreateOrderDto {
  @ApiProperty({ example: 'BTCUSDT' })
  @IsString()
  symbol: string;

  @ApiProperty({ enum: OrderTypeEnum, example: OrderTypeEnum.MARKET })
  @IsEnum(OrderTypeEnum)
  type: OrderType;

  @ApiProperty({ enum: OrderSideEnum, example: OrderSideEnum.BUY })
  @IsEnum(OrderSideEnum)
  side: OrderSide;

  @ApiProperty({ example: 0.001 })
  @IsNumber()
  @Min(0.00000001)
  quantity: number;

  @ApiProperty({ example: 45000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number;
}
