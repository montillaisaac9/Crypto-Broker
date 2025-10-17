#!/usr/bin/env node

/**
 * Script para verificar la configuración de Supabase
 * Uso: node scripts/verify-supabase.js
 */

const { Client } = require('pg');

async function verifySupabaseConfig() {
  console.log('🔍 Verificando configuración de Supabase...\n');

  // Verificar variables de entorno
  const requiredVars = [
    'DATABASE_HOST',
    'DATABASE_PORT', 
    'DATABASE_USER',
    'DATABASE_NAME',
    'DATABASE_PASSWORD'
  ];

  console.log('📋 Variables de entorno:');
  let allVarsConfigured = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    const isConfigured = !!value;
    const displayValue = varName === 'DATABASE_PASSWORD' 
      ? (value ? '***configurada***' : '❌ NO CONFIGURADA')
      : (value || '❌ NO CONFIGURADA');
    
    console.log(`   ${varName}: ${displayValue}`);
    
    if (!isConfigured) {
      allVarsConfigured = false;
    }
  }

  if (!allVarsConfigured) {
    console.log('\n❌ Error: Faltan variables de entorno requeridas');
    console.log('💡 Configura las variables de entorno:');
    console.log('   export DATABASE_HOST="aws-1-us-east-2.pooler.supabase.com"');
    console.log('   export DATABASE_PORT="5432"');
    console.log('   export DATABASE_USER="postgres.xovayflzewnveizvhnua"');
    console.log('   export DATABASE_NAME="postgres"');
    console.log('   export DATABASE_PASSWORD="tu_contraseña_real"');
    process.exit(1);
  }

  // Configuración de conexión
  const config = {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  };

  console.log('\n🔗 Configuración de conexión:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   SSL: Habilitado`);

  const client = new Client(config);

  try {
    console.log('\n⏳ Intentando conectar a Supabase...');
    await client.connect();
    console.log('✅ Conexión exitosa a Supabase!\n');

    // Verificar información de la conexión
    console.log('📊 Información de la conexión:');
    const result = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        version() as version,
        inet_server_addr() as server_address,
        inet_server_port() as server_port,
        now() as current_time
    `);
    
    const info = result.rows[0];
    console.log(`   Base de datos: ${info.database_name}`);
    console.log(`   Usuario: ${info.current_user}`);
    console.log(`   Servidor: ${info.server_address}:${info.server_port}`);
    console.log(`   Versión: ${info.version.split(' ')[0]} ${info.version.split(' ')[1]}`);
    console.log(`   Hora del servidor: ${info.current_time}`);

    // Verificar configuración de pooler
    console.log('\n🔧 Verificando configuración de pooler:');
    try {
      const poolerInfo = await client.query(`
        SELECT 
          setting as pooler_mode
        FROM pg_settings 
        WHERE name = 'pool_mode'
      `);
      
      if (poolerInfo.rows.length > 0) {
        console.log(`   Modo de pooler: ${poolerInfo.rows[0].pooler_mode || 'No configurado'}`);
      } else {
        console.log('   Modo de pooler: No disponible (normal en pooler)');
      }
    } catch (error) {
      console.log('   Modo de pooler: No disponible (normal en pooler)');
    }

    // Verificar conexiones activas
    console.log('\n📈 Verificando conexiones activas:');
    try {
      const connections = await client.query(`
        SELECT 
          count(*) as active_connections
        FROM pg_stat_activity 
        WHERE state = 'active'
      `);
      console.log(`   Conexiones activas: ${connections.rows[0].active_connections}`);
    } catch (error) {
      console.log('   Conexiones activas: No disponible');
    }

    console.log('\n🎉 ¡Verificación completada exitosamente!');
    console.log('✅ La configuración de Supabase es correcta.');
    console.log('✅ La aplicación debería conectarse sin problemas.');

  } catch (error) {
    console.log('\n❌ Error de conexión:');
    console.log(`   Código: ${error.code}`);
    console.log(`   Mensaje: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verificar que la contraseña sea correcta');
      console.log('   2. Verificar que Supabase esté activo (no pausado)');
      console.log('   3. Verificar que el pooler esté habilitado');
      console.log('   4. Verificar que las conexiones externas estén permitidas');
    } else if (error.code === '28P01') {
      console.log('\n💡 Error de autenticación:');
      console.log('   1. Verificar que la contraseña sea correcta');
      console.log('   2. Verificar que el usuario sea correcto');
      console.log('   3. Verificar que la base de datos sea correcta');
    } else if (error.code === '3D000') {
      console.log('\n💡 Base de datos no encontrada:');
      console.log('   1. Verificar que el nombre de la base de datos sea correcto');
      console.log('   2. Verificar que la base de datos exista en Supabase');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Host no encontrado:');
      console.log('   1. Verificar que el host sea correcto');
      console.log('   2. Verificar la conexión a internet');
    }
    
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada.');
  }
}

// Ejecutar la verificación
verifySupabaseConfig().catch(console.error);
