import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '../types/prisma.types';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(registerDto: { email: string; password: string }): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(registerDto.password, saltRounds);

    // Crear usuario y balance inicial en una transacción
    const savedUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: registerDto.email,
          passwordHash: password_hash,
        },
      });

      // Crear balance inicial de 10,000 USDT
      await tx.balance.create({
        data: {
          userId: user.id,
          currency: 'USDT',
          amount: 10000,
        },
      });

      return user;
    });

    return savedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
