import { ApiProperty } from '@nestjs/swagger';

export class BalanceDto {
  @ApiProperty({ example: 'USDT' })
  currency: string;

  @ApiProperty({ example: 10000 })
  amount: number;

  @ApiProperty({ example: 10000 })
  usd_value: number;
}
