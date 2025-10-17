import { IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CandlestickDto {
  @ApiProperty({ description: 'Símbolo del par de trading', example: 'BTCUSDT' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Intervalo de tiempo', example: '1m' })
  @IsString()
  interval: string;

  @ApiProperty({ description: 'Precio de apertura', example: 45000.50 })
  @IsNumber()
  open: number;

  @ApiProperty({ description: 'Precio más alto', example: 46000.75 })
  @IsNumber()
  high: number;

  @ApiProperty({ description: 'Precio más bajo', example: 44500.25 })
  @IsNumber()
  low: number;

  @ApiProperty({ description: 'Precio de cierre', example: 45500.00 })
  @IsNumber()
  close: number;

  @ApiProperty({ description: 'Volumen de trading', example: 1234.567 })
  @IsNumber()
  volume: number;

  @ApiProperty({ description: 'Timestamp de apertura de la vela', example: '2024-01-15T10:30:00.000Z' })
  @IsDateString()
  openTime: string;

  @ApiProperty({ description: 'Timestamp de cierre de la vela', example: '2024-01-15T10:31:00.000Z' })
  @IsDateString()
  closeTime: string;

  @ApiProperty({ description: 'Indica si la vela está cerrada', example: true })
  isClosed: boolean;
}

export enum BinanceInterval {
  ONE_MINUTE = '1m',
  THREE_MINUTES = '3m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  THIRTY_MINUTES = '30m',
  ONE_HOUR = '1h',
  TWO_HOURS = '2h',
  FOUR_HOURS = '4h',
  SIX_HOURS = '6h',
  EIGHT_HOURS = '8h',
  TWELVE_HOURS = '12h',
  ONE_DAY = '1d',
  THREE_DAYS = '3d',
  ONE_WEEK = '1w',
  ONE_MONTH = '1M',
}

export const SUPPORTED_INTERVALS = Object.values(BinanceInterval);
