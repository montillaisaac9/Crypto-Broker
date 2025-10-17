import { Module } from '@nestjs/common';
import { ChartGateway } from './chart.gateway';
import { CandlestickService } from './candlestick.service';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [MarketModule],
  providers: [ChartGateway, CandlestickService],
  exports: [ChartGateway, CandlestickService],
})
export class WebsocketModule {}
