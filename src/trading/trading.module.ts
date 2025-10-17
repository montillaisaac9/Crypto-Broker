import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradingController } from './trading.controller';
import { TradingService } from './trading.service';
import { MarketModule } from '../market/market.module';
import { Balance } from '../entities/balance.entity';
import { Holding } from '../entities/holding.entity';
import { Trade } from '../entities/trade.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Balance, Holding, Trade]),
    MarketModule,
  ],
  controllers: [TradingController],
  providers: [TradingService],
  exports: [TradingService],
})
export class TradingModule {}
