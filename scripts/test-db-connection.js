#!/usr/bin/env node

/**
 * Script para probar la conexión a la base de datos Supabase
 * Uso: node scripts/test-db-connection.js
 */

const { Client } = require('pg');

async function testConnection() {
  console.log('🔍 Probando conexión a Supabase...\n');

  // Configuración de la base de datos
  const config = {
    host: process.env.DATABASE_HOST || 'aws-1-us-east-2.pooler.supabase.com',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USER || 'postgres.xovayflzewnveizvhnua',
    password: process.env.DATABASE_PASSWORD || 'TU_CONTRASEÑA_AQUÍ',
    database: process.env.DATABASE_NAME || 'postgres',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };

  console.log('📋 Configuración:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   SSL: ${config.ssl ? 'Habilitado' : 'Deshabilitado'}`);
  console.log(`   Password: ${config.password ? '***configurada***' : '❌ NO CONFIGURADA'}\n`);

  if (!config.password || config.password === 'TU_CONTRASEÑA_AQUÍ') {
    console.log('❌ Error: DATABASE_PASSWORD no está configurada');
    console.log('💡 Configura la variable de entorno:');
    console.log('   export DATABASE_PASSWORD="tu_contraseña_real_de_supabase"');
    process.exit(1);
  }

  const client = new Client(config);

  try {
    console.log('⏳ Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa!\n');

    // Probar consulta simple
    console.log('⏳ Probando consulta...');
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Consulta exitosa!');
    console.log(`   Hora actual: ${result.rows[0].current_time}`);
    console.log(`   Versión PostgreSQL: ${result.rows[0].version.split(' ')[0]}\n`);

    // Probar información de la base de datos
    console.log('⏳ Obteniendo información de la base de datos...');
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        inet_server_addr() as server_address,
        inet_server_port() as server_port
    `);
    
    console.log('✅ Información de la base de datos:');
    console.log(`   Base de datos: ${dbInfo.rows[0].database_name}`);
    console.log(`   Usuario: ${dbInfo.rows[0].current_user}`);
    console.log(`   Servidor: ${dbInfo.rows[0].server_address}:${dbInfo.rows[0].server_port}\n`);

    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('✅ La configuración de la base de datos es correcta.');

  } catch (error) {
    console.log('❌ Error de conexión:');
    console.log(`   Código: ${error.code}`);
    console.log(`   Mensaje: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verificar que la contraseña sea correcta');
      console.log('   2. Verificar que el host y puerto sean correctos');
      console.log('   3. Verificar que Supabase esté funcionando');
    } else if (error.code === '28P01') {
      console.log('\n💡 Error de autenticación:');
      console.log('   1. Verificar que la contraseña sea correcta');
      console.log('   2. Verificar que el usuario sea correcto');
    } else if (error.code === '3D000') {
      console.log('\n💡 Base de datos no encontrada:');
      console.log('   1. Verificar que el nombre de la base de datos sea correcto');
    }
    
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada.');
  }
}

// Ejecutar el test
testConnection().catch(console.error);
