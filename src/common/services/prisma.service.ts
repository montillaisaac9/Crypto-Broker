import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  async onModuleInit() {
    console.log('🔗 Conectando a la base de datos con Prisma...');
    try {
      await this.$connect();
      console.log('✅ Conexión a la base de datos exitosa con Prisma');
    } catch (error) {
      console.error('❌ Error al conectar a la base de datos:', error.message);
      throw error;
    }
  }

  async onModuleDestroy() {
    console.log('🔌 Cerrando conexión a la base de datos...');
    await this.$disconnect();
  }

  async enableShutdownHooks(app: any) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
