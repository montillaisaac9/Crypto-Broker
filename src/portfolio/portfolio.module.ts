import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { MarketModule } from '../market/market.module';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  imports: [MarketModule],
  controllers: [PortfolioController],
  providers: [PortfolioService, PrismaService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
