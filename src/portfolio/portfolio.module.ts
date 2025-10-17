import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { MarketModule } from '../market/market.module';
import { Balance } from '../entities/balance.entity';
import { Holding } from '../entities/holding.entity';
import { Trade } from '../entities/trade.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Balance, Holding, Trade]),
    MarketModule,
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
