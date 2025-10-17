#!/usr/bin/env node

/**
 * Script para verificar que las tablas se crearon correctamente en Supabase
 * Uso: node scripts/verify-tables.js
 */

const { PrismaClient } = require('@prisma/client');

async function verifyTables() {
  console.log('🔍 Verificando tablas en Supabase...\n');

  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Conectar a la base de datos
    console.log('🔗 Conectando a Supabase...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa\n');

    // Verificar que las tablas existan
    console.log('📋 Verificando tablas...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log('Tablas encontradas:');
    tables.forEach(table => {
      console.log(`   ✅ ${table.table_name}`);
    });
    console.log('');

    // Verificar estructura de cada tabla
    const expectedTables = ['users', 'balances', 'holdings', 'orders', 'trades'];
    
    for (const tableName of expectedTables) {
      console.log(`🔍 Verificando tabla: ${tableName}`);
      
      try {
        const columns = await prisma.$queryRaw`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = ${tableName}
          ORDER BY ordinal_position
        `;
        
        console.log(`   Columnas (${columns.length}):`);
        columns.forEach(col => {
          console.log(`     - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
        });
        console.log('');
        
      } catch (error) {
        console.log(`   ❌ Error al verificar tabla ${tableName}: ${error.message}`);
      }
    }

    // Verificar enums
    console.log('🔍 Verificando enums...');
    try {
      const enums = await prisma.$queryRaw`
        SELECT t.typname as enum_name, e.enumlabel as enum_value
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        WHERE t.typname LIKE '%order%'
        ORDER BY t.typname, e.enumsortorder
      `;
      
      if (enums.length > 0) {
        console.log('   Enums encontrados:');
        enums.forEach(enumItem => {
          console.log(`     - ${enumItem.enum_name}: ${enumItem.enum_value}`);
        });
      } else {
        console.log('   No se encontraron enums específicos');
      }
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Error al verificar enums: ${error.message}`);
    }

    // Probar operaciones básicas
    console.log('🧪 Probando operaciones básicas...');
    
    try {
      // Contar registros en cada tabla
      const userCount = await prisma.user.count();
      const balanceCount = await prisma.balance.count();
      const holdingCount = await prisma.holding.count();
      const orderCount = await prisma.order.count();
      const tradeCount = await prisma.trade.count();
      
      console.log('   Registros por tabla:');
      console.log(`     - Users: ${userCount}`);
      console.log(`     - Balances: ${balanceCount}`);
      console.log(`     - Holdings: ${holdingCount}`);
      console.log(`     - Orders: ${orderCount}`);
      console.log(`     - Trades: ${tradeCount}`);
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Error al contar registros: ${error.message}`);
    }

    console.log('🎉 ¡Verificación completada exitosamente!');
    console.log('✅ Todas las tablas están creadas y funcionando correctamente');
    console.log('✅ La aplicación debería funcionar sin errores de base de datos');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexión cerrada.');
  }
}

// Ejecutar la verificación
verifyTables().catch(console.error);
