import { ApiProperty } from '@nestjs/swagger';

export class SymbolDto {
  @ApiProperty({ example: 'BTCUSDT' })
  symbol: string;

  @ApiProperty({ example: 'BTC' })
  baseAsset: string;

  @ApiProperty({ example: 'USDT' })
  quoteAsset: string;

  @ApiProperty({ example: 'TRADING' })
  status: string;

  @ApiProperty({ example: '0.00001000' })
  minQty: string;

  @ApiProperty({ example: '0.01' })
  stepSize: string;

  @ApiProperty({ example: '0.01' })
  tickSize: string;
}
