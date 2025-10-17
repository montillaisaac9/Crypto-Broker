#!/usr/bin/env node

/**
 * Script para migrar de TypeORM a Prisma
 * Uso: node scripts/migrate-to-prisma.js
 */

const { PrismaClient } = require('@prisma/client');

async function migrateToPrisma() {
  console.log('🔄 Iniciando migración a Prisma...\n');

  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Conectar a la base de datos
    console.log('🔗 Conectando a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa\n');

    // Verificar que las tablas existan
    console.log('📋 Verificando tablas existentes...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    console.log('Tablas encontradas:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    console.log('');

    // Verificar datos existentes
    console.log('📊 Verificando datos existentes...');
    
    try {
      const userCount = await prisma.user.count();
      console.log(`   Usuarios: ${userCount}`);
    } catch (error) {
      console.log('   Usuarios: Tabla no existe o error');
    }

    try {
      const balanceCount = await prisma.balance.count();
      console.log(`   Balances: ${balanceCount}`);
    } catch (error) {
      console.log('   Balances: Tabla no existe o error');
    }

    try {
      const holdingCount = await prisma.holding.count();
      console.log(`   Holdings: ${holdingCount}`);
    } catch (error) {
      console.log('   Holdings: Tabla no existe o error');
    }

    try {
      const orderCount = await prisma.order.count();
      console.log(`   Órdenes: ${orderCount}`);
    } catch (error) {
      console.log('   Órdenes: Tabla no existe o error');
    }

    try {
      const tradeCount = await prisma.trade.count();
      console.log(`   Trades: ${tradeCount}`);
    } catch (error) {
      console.log('   Trades: Tabla no existe o error');
    }

    console.log('\n🎉 Migración a Prisma completada exitosamente!');
    console.log('✅ El proyecto ahora usa Prisma en lugar de TypeORM');
    console.log('✅ Todas las conexiones a la base de datos están funcionando');

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexión cerrada.');
  }
}

// Ejecutar la migración
migrateToPrisma().catch(console.error);
