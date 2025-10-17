import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BinanceInterval } from './candlestick.dto';

export class SubscribeToChartDto {
  @ApiProperty({ 
    description: 'Símbolo del par de trading', 
    example: 'BTCUSDT',
    enum: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOTUSDT', 'MATICUSDT', 'LINKUSDT']
  })
  @IsString()
  symbol: string;

  @ApiProperty({ 
    description: 'Intervalo de tiempo para las velas', 
    example: '1m',
    enum: BinanceInterval
  })
  @IsEnum(BinanceInterval)
  interval: BinanceInterval;
}

export class UnsubscribeFromChartDto {
  @ApiProperty({ 
    description: 'Símbolo del par de trading', 
    example: 'BTCUSDT'
  })
  @IsString()
  symbol: string;

  @ApiProperty({ 
    description: 'Intervalo de tiempo', 
    example: '1m',
    enum: BinanceInterval
  })
  @IsEnum(BinanceInterval)
  interval: BinanceInterval;
}

export class ChartSubscriptionInfo {
  @ApiProperty({ description: 'Símbolo suscrito', example: 'BTCUSDT' })
  symbol: string;

  @ApiProperty({ description: 'Intervalo suscrito', example: '1m' })
  interval: string;

  @ApiProperty({ description: 'Número de clientes suscritos', example: 3 })
  subscriberCount: number;

  @ApiProperty({ description: 'Indica si la conexión está activa', example: true })
  isActive: boolean;
}
