import { ApiProperty } from '@nestjs/swagger';
import { BalanceDto } from './balance.dto';
import { HoldingDto } from './holding.dto';

export class PortfolioSummaryDto {
  @ApiProperty({ type: [BalanceDto] })
  balances: BalanceDto[];

  @ApiProperty({ type: [HoldingDto] })
  holdings: HoldingDto[];

  @ApiProperty({ example: 50000 })
  total_portfolio_value: number;

  @ApiProperty({ example: 1000 })
  total_unrealized_pnl: number;

  @ApiProperty({ example: 2.04 })
  total_unrealized_pnl_percent: number;
}
