import { Module } from '@nestjs/common';
import { TradingController } from './trading.controller';
import { TradingService } from './trading.service';
import { MarketModule } from '../market/market.module';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  imports: [MarketModule],
  controllers: [TradingController],
  providers: [TradingService, PrismaService],
  exports: [TradingService],
})
export class TradingModule {}
