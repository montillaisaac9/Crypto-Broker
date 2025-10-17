# 🐳 Dockerización del Trading Exchange Backend

Este proyecto está completamente dockerizado y optimizado para despliegue en Render.

## 📁 Archivos de Docker

- `Dockerfile` - Imagen optimizada para producción
- `docker-compose.yml` - Configuración para desarrollo con Supabase
- `docker-compose.local.yml` - Configuración para desarrollo con PostgreSQL local
- `docker-compose.prod.yml` - Configuración para producción
- `.dockerignore` - Archivos a ignorar en el build
- `render.yaml` - Configuración específica para Render
- `env.example` - Variables de entorno de ejemplo

## 🚀 Comandos Disponibles

### Desarrollo Local
```bash
# Desarrollo con Supabase (recomendado)
npm run docker:dev

# Desarrollo con PostgreSQL local
npm run docker:dev:local

# Solo construir la imagen
npm run docker:build

# Ejecutar la imagen construida
npm run docker:run
```

### Producción
```bash
# Construir y ejecutar en modo producción
npm run docker:prod
```

## 🗄️ Configuración de Supabase

### Variables de Conexión
El proyecto está configurado para usar Supabase con los siguientes parámetros:

```env
DATABASE_HOST=aws-1-us-east-2.pooler.supabase.com
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres.xovayflzewnveizvhnua
DATABASE_POOL_MODE=session
```

### Configuración Local

#### Opción 1: Desarrollo con Supabase (Recomendado)
```bash
# 1. Crear archivo .env
cp env.example .env

# 2. Editar .env y configurar tu DATABASE_PASSWORD real de Supabase
# 3. Ejecutar con Supabase
npm run docker:dev
```

#### Opción 2: Desarrollo con PostgreSQL Local
```bash
# Ejecutar con base de datos local
npm run docker:dev:local
```

**Nota**: La opción 1 es recomendada ya que simula el entorno de producción.

### Diferencias entre Configuraciones

| Archivo | Base de Datos | Uso Recomendado |
|---------|---------------|-----------------|
| `docker-compose.yml` | Supabase (remoto) | Desarrollo y testing |
| `docker-compose.local.yml` | PostgreSQL local | Desarrollo offline |
| `docker-compose.prod.yml` | Supabase (remoto) | Producción local |

### Pooler de Supabase
- **Modo**: `session` - Cada conexión mantiene su sesión
- **Host**: Pooler de Supabase en AWS us-east-2
- **Usuario**: Formato `postgres.[project-ref]`

## 🔧 Configuración para Render

### 1. Variables de Entorno Requeridas
Configura estas variables en el dashboard de Render:

```env
NODE_ENV=production
DATABASE_HOST=aws-1-us-east-2.pooler.supabase.com
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres.xovayflzewnveizvhnua
DATABASE_PASSWORD=tu-password-de-supabase
DATABASE_POOL_MODE=session
JWT_SECRET=tu-jwt-secret-super-seguro
JWT_EXPIRES_IN=24h
CORS_ORIGIN=*
SWAGGER_ENABLED=true
LOG_LEVEL=info
DEFAULT_BALANCE=10000
MIN_ORDER_AMOUNT=0.01
MAX_ORDER_AMOUNT=1000000
```

### 2. Configuración del Servicio Web
- **Build Command**: (dejar vacío)
- **Start Command**: (dejar vacío)
- **Environment**: Docker
- **Dockerfile Path**: `./Dockerfile`
- **Health Check Path**: `/health`

### 3. Base de Datos Supabase
El proyecto está configurado para usar Supabase como base de datos. Asegúrate de:

1. **Crear un proyecto en Supabase** (https://supabase.com)
2. **Obtener la contraseña de la base de datos** desde el dashboard de Supabase
3. **Configurar la variable `DATABASE_PASSWORD`** en Render con la contraseña real
4. **Verificar que el pooler esté habilitado** en la configuración de Supabase

**Nota**: No necesitas crear una base de datos en Render, ya que estás usando Supabase.

## 🏗️ Características del Dockerfile

### Multi-stage Build
- **Base**: Imagen Node.js Alpine optimizada
- **Deps**: Instalación de dependencias de producción
- **Builder**: Compilación de la aplicación
- **Runner**: Imagen final optimizada

### Optimizaciones de Seguridad
- Usuario no-root (`nestjs`)
- `dumb-init` para manejo correcto de señales
- Health check integrado
- Variables de entorno configuradas

### Optimizaciones de Rendimiento
- Imagen Alpine (menor tamaño)
- Solo dependencias de producción
- Cache de npm optimizado
- Build multi-stage

## 🔍 Health Check

### Endpoints de Monitoreo

#### `/health` - Estado General
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

#### `/health/database` - Estado de la Base de Datos
```json
{
  "isConnected": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `/keepalive` - Keep-Alive Manual
```json
{
  "success": true,
  "message": "Keep-alive ejecutado exitosamente",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔄 Sistema de Keep-Alive

### Configuración Automática
El sistema incluye un keep-alive automático para mantener la conexión con Supabase activa:

- **Cada 30 minutos**: Keep-alive básico (`SELECT 1`)
- **Diario a las 2:00 AM**: Keep-alive robusto con verificación completa
- **Horario laboral (8:00-18:00, L-V)**: Keep-alive cada 5 minutos
- **Reconexión automática**: En caso de error, intenta reconectar

### Variables de Entorno
```env
KEEPALIVE_ENABLED=true
KEEPALIVE_INTERVAL_MINUTES=30
KEEPALIVE_DAILY_HOUR=2
KEEPALIVE_BUSINESS_HOURS=true
```

### Beneficios
- ✅ **Evita timeouts de conexión** en Supabase
- ✅ **Mantiene el pool de conexiones activo**
- ✅ **Reconexión automática** en caso de fallos
- ✅ **Monitoreo continuo** del estado de la base de datos

## 📊 Monitoreo

### Logs
Los logs se muestran en tiempo real usando:
```bash
docker-compose logs -f app
```

### Métricas
- Uptime del proceso
- Timestamp de respuesta
- Estado de salud de la base de datos
- Logs de keep-alive automático

## 🛠️ Troubleshooting

### Problemas Comunes

1. **Error de conexión a base de datos**
   - Verificar variables de entorno
   - Comprobar que PostgreSQL esté ejecutándose

2. **Build fallido**
   - Verificar que todas las dependencias estén en `package.json`
   - Comprobar que no haya errores de TypeScript

3. **Health check fallido**
   - Verificar que el puerto 3000 esté expuesto
   - Comprobar que la aplicación esté respondiendo

4. **Problemas de conexión a la base de datos**
   - Verificar logs de keep-alive: `docker logs trading-exchange-app | grep keep-alive`
   - Comprobar estado de la base de datos: `curl http://localhost:3000/health/database`
   - Ejecutar keep-alive manual: `curl http://localhost:3000/keepalive`

### Comandos de Debug
```bash
# Ver logs del contenedor
docker logs trading-exchange-app

# Ver logs específicos de keep-alive
docker logs trading-exchange-app | grep -i "keep-alive\|database"

# Entrar al contenedor
docker exec -it trading-exchange-app sh

# Verificar variables de entorno
docker exec trading-exchange-app env

# Verificar estado de la base de datos
curl http://localhost:3000/health/database

# Ejecutar keep-alive manual
curl http://localhost:3000/keepalive
```

## 🔄 Actualizaciones

Para actualizar la aplicación:
1. Hacer commit de los cambios
2. Render detectará automáticamente los cambios
3. Se ejecutará un nuevo build
4. La aplicación se reiniciará automáticamente

## 📝 Notas Importantes

- El puerto 3000 debe estar expuesto
- Las variables de entorno son obligatorias
- El health check es necesario para Render
- La base de datos debe estar disponible antes del inicio
