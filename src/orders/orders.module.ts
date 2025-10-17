import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { MarketModule } from '../market/market.module';
import { TradingModule } from '../trading/trading.module';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MarketModule,
    TradingModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
  exports: [OrdersService],
})
export class OrdersModule {}
