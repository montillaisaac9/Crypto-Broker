import { ApiProperty } from '@nestjs/swagger';

export class HoldingDto {
  @ApiProperty({ example: 'BTC' })
  symbol: string;

  @ApiProperty({ example: 0.5 })
  quantity: number;

  @ApiProperty({ example: 45000 })
  avg_purchase_price: number;

  @ApiProperty({ example: 46000 })
  current_price: number;

  @ApiProperty({ example: 23000 })
  current_value: number;

  @ApiProperty({ example: 22500 })
  total_cost: number;

  @ApiProperty({ example: 500 })
  unrealized_pnl: number;

  @ApiProperty({ example: 2.22 })
  unrealized_pnl_percent: number;
}
