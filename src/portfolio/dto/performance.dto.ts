import { ApiProperty } from '@nestjs/swagger';

export class PerformanceDto {
  @ApiProperty({ example: 1000 })
  total_unrealized_pnl: number;

  @ApiProperty({ example: 2.04 })
  total_unrealized_pnl_percent: number;

  @ApiProperty({ example: 500 })
  total_realized_pnl: number;

  @ApiProperty({ example: 1.02 })
  total_realized_pnl_percent: number;

  @ApiProperty({ example: 1500 })
  total_pnl: number;

  @ApiProperty({ example: 3.06 })
  total_pnl_percent: number;

  @ApiProperty({ example: 25 })
  total_trades: number;

  @ApiProperty({ example: 15 })
  winning_trades: number;

  @ApiProperty({ example: 10 })
  losing_trades: number;

  @ApiProperty({ example: 60 })
  win_rate: number;
}
