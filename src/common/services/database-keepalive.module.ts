import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseKeepAliveService } from './database-keepalive.service';

@Module({
  imports: [TypeOrmModule],
  providers: [DatabaseKeepAliveService],
  exports: [DatabaseKeepAliveService],
})
export class DatabaseKeepAliveModule {}
