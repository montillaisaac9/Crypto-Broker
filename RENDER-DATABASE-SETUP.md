# 🗄️ Configuración de Base de Datos en Render

## ❌ **Problema Actual**

El error en Render muestra:
```
ERROR [TypeOrmModule] Unable to connect to the database. Retrying (1)...
AggregateError [ECONNREFUSED]: 
Error: connect ECONNREFUSED ::1:5440
Error: connect ECONNREFUSED 127.0.0.1:5440
```

## 🔍 **Causa del Problema**

1. **Variables de entorno incorrectas**: El código estaba usando `DB_HOST`, `DB_PORT`, etc., pero configuramos `DATABASE_HOST`, `DATABASE_PORT`, etc.
2. **Falta la contraseña de Supabase**: La variable `DATABASE_PASSWORD` no está configurada en Render.
3. **Configuración SSL**: Falta configuración SSL para Supabase.

## ✅ **Solución Implementada**

### 1. **Corregida Configuración de Base de Datos**
```typescript
// src/config/database.config.ts
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '12345678',
  database: process.env.DATABASE_NAME || 'crypto_broker',
  entities: [User, Balance, Holding, Order, Trade],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  retryAttempts: 10,
  retryDelay: 3000,
  autoLoadEntities: true,
  extra: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
};
```

### 2. **Variables de Entorno Configuradas**
```yaml
# render.yaml
envVars:
  - key: DATABASE_HOST
    value: aws-1-us-east-2.pooler.supabase.com
  - key: DATABASE_PORT
    value: 5432
  - key: DATABASE_NAME
    value: postgres
  - key: DATABASE_USER
    value: postgres.xovayflzewnveizvhnua
  - key: DATABASE_PASSWORD
    sync: false  # ⚠️ DEBE CONFIGURARSE MANUALMENTE
```

## 🚨 **Acción Requerida en Render**

### **PASO CRÍTICO**: Configurar la contraseña de Supabase

1. **Ir al dashboard de Render**
2. **Seleccionar tu servicio web**
3. **Ir a la sección "Environment"**
4. **Agregar la variable de entorno:**
   - **Key**: `DATABASE_PASSWORD`
   - **Value**: `[TU_CONTRASEÑA_REAL_DE_SUPABASE]`

### **Cómo obtener la contraseña de Supabase:**

1. **Ir a tu proyecto en Supabase** (https://supabase.com)
2. **Ir a Settings > Database**
3. **En la sección "Connection string"**
4. **Copiar la contraseña** del string de conexión

**Ejemplo de string de conexión:**
```
postgresql://postgres.xovayflzewnveizvhnua:[CONTRASEÑA_AQUÍ]@aws-1-us-east-2.pooler.supabase.com:5432/postgres
```

## 🔧 **Configuración Completa en Render**

### **Variables de Entorno Requeridas:**

| Variable | Valor | Estado |
|----------|-------|--------|
| `NODE_ENV` | `production` | ✅ Configurado |
| `PORT` | `3000` | ✅ Configurado |
| `DATABASE_HOST` | `aws-1-us-east-2.pooler.supabase.com` | ✅ Configurado |
| `DATABASE_PORT` | `5432` | ✅ Configurado |
| `DATABASE_NAME` | `postgres` | ✅ Configurado |
| `DATABASE_USER` | `postgres.xovayflzewnveizvhnua` | ✅ Configurado |
| `DATABASE_PASSWORD` | `[TU_CONTRASEÑA]` | ❌ **FALTA CONFIGURAR** |
| `JWT_SECRET` | `[GENERADO_AUTOMÁTICAMENTE]` | ✅ Configurado |

### **Variables Opcionales:**
- `DATABASE_POOL_MODE` = `session`
- `KEEPALIVE_ENABLED` = `true`
- `CORS_ORIGIN` = `*`
- `SWAGGER_ENABLED` = `true`

## 🧪 **Verificación**

### **1. Verificar Conexión Local**
```bash
# Probar con variables de entorno locales
export DATABASE_HOST=aws-1-us-east-2.pooler.supabase.com
export DATABASE_PORT=5432
export DATABASE_NAME=postgres
export DATABASE_USER=postgres.xovayflzewnveizvhnua
export DATABASE_PASSWORD=tu_contraseña_real
export NODE_ENV=production

npm run start:prod
```

### **2. Verificar en Render**
Después de configurar `DATABASE_PASSWORD`:
1. **Hacer redeploy** del servicio
2. **Verificar logs** - debería mostrar conexión exitosa
3. **Probar endpoint** `/health/database`

## 📋 **Pasos para Solucionar**

### **1. Configurar Contraseña en Render**
- ✅ Ir a dashboard de Render
- ✅ Agregar variable `DATABASE_PASSWORD`
- ✅ Usar contraseña real de Supabase

### **2. Hacer Redeploy**
```bash
git add .
git commit -m "fix: corregir configuración de base de datos para Supabase"
git push
```

### **3. Verificar Logs**
- ✅ No más errores `ECONNREFUSED`
- ✅ Conexión exitosa a Supabase
- ✅ Aplicación funcionando

## 🔍 **Troubleshooting**

### **Si sigue fallando:**

1. **Verificar contraseña de Supabase:**
   - Ir a Supabase > Settings > Database
   - Verificar que la contraseña sea correcta

2. **Verificar configuración de Supabase:**
   - Pooler habilitado
   - Conexiones permitidas desde cualquier IP

3. **Verificar variables en Render:**
   - Todas las variables `DATABASE_*` configuradas
   - Sin espacios extra en los valores

4. **Verificar logs detallados:**
   - Revisar logs completos en Render
   - Buscar errores específicos de conexión

## ✅ **Estado Actual**

- ✅ Configuración de código corregida
- ✅ Variables de entorno configuradas
- ❌ **FALTA**: Configurar `DATABASE_PASSWORD` en Render
- ❌ **FALTA**: Hacer redeploy

**🎯 Una vez configurada la contraseña en Render, la aplicación debería conectarse exitosamente a Supabase.**
