import { ApiProperty } from '@nestjs/swagger';

export class PriceDto {
  @ApiProperty({ example: 'BTCUSDT' })
  symbol: string;

  @ApiProperty({ example: '45000.50' })
  price: string;

  @ApiProperty({ example: '0.25' })
  priceChange: string;

  @ApiProperty({ example: '0.56' })
  priceChangePercent: string;

  @ApiProperty({ example: '1000.25' })
  volume: string;

  @ApiProperty({ example: '45000.00' })
  highPrice: string;

  @ApiProperty({ example: '44000.00' })
  lowPrice: string;
}
