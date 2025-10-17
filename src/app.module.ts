import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MarketModule } from './market/market.module';
import { TradingModule } from './trading/trading.module';
import { OrdersModule } from './orders/orders.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { WebsocketModule } from './websocket/websocket.module';
import { DatabaseKeepAliveModule } from './common/services/database-keepalive.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(databaseConfig),
    DatabaseKeepAliveModule,
    AuthModule,
    UsersModule,
    MarketModule,
    TradingModule,
    OrdersModule,
    PortfolioModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
