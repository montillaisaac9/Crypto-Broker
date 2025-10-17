import { Module } from '@nestjs/common';
import { ChartGateway } from './chart.gateway';
import { CandlestickService } from './candlestick.service';
import { WebsocketDocsController } from './websocket-docs.controller';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [MarketModule],
  controllers: [WebsocketDocsController],
  providers: [ChartGateway, CandlestickService],
  exports: [ChartGateway, CandlestickService],
})
export class WebsocketModule {}
