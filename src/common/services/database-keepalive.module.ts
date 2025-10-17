import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DatabaseKeepAliveService } from './database-keepalive.service';

@Module({
  providers: [PrismaService, DatabaseKeepAliveService],
  exports: [PrismaService, DatabaseKeepAliveService],
})
export class DatabaseKeepAliveModule {}
