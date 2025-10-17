import { ApiProperty } from '@nestjs/swagger';

export class TradeResponseDto {
  @ApiProperty({ example: 1 })
  trade_id: number;

  @ApiProperty({ example: 'BTCUSDT' })
  symbol: string;

  @ApiProperty({ example: 'buy' })
  side: string;

  @ApiProperty({ example: 0.001 })
  quantity: number;

  @ApiProperty({ example: 45000 })
  price: number;

  @ApiProperty({ example: 45 })
  total: number;

  @ApiProperty({ example: 0.045 })
  fee: number;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  executed_at: Date;

  @ApiProperty({ example: 10000 })
  remaining_balance: number;
}
