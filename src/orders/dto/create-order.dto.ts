import { IsString, IsNumber, Min, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderType, OrderSide } from '../../types/prisma.types';

export class CreateOrderDto {
  @ApiProperty({ example: 'BTCUSDT' })
  @IsString()
  symbol: string;

  @ApiProperty({ enum: OrderType, example: OrderType.MARKET })
  @IsEnum(OrderType)
  type: OrderType;

  @ApiProperty({ enum: OrderSide, example: OrderSide.BUY })
  @IsEnum(OrderSide)
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
