import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { Balance } from '../entities/balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Balance])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
