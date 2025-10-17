#!/bin/bash

# Script de inicio optimizado para producción
set -e

echo "🚀 Iniciando Trading Exchange Backend..."

# Verificar que las variables de entorno requeridas estén configuradas
required_vars=("DATABASE_HOST" "DATABASE_NAME" "DATABASE_USER" "DATABASE_PASSWORD" "JWT_SECRET")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Variable de entorno $var no está configurada"
        exit 1
    fi
done

echo "✅ Variables de entorno verificadas"

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Cliente de Prisma generado exitosamente"
else
    echo "❌ Error: No se pudo generar el cliente de Prisma"
    exit 1
fi

# Esperar a que la base de datos esté disponible
echo "⏳ Esperando conexión a la base de datos..."
echo "🔗 Conectando a: $DATABASE_HOST:$DATABASE_PORT"

# Intentar conectar a la base de datos (Supabase o PostgreSQL local)
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if pg_isready -h "$DATABASE_HOST" -p "${DATABASE_PORT:-5432}" -U "$DATABASE_USER" >/dev/null 2>&1; then
        echo "✅ Base de datos conectada exitosamente"
        break
    else
        echo "⏳ Intento $attempt/$max_attempts - Base de datos no disponible, esperando..."
        sleep 2
        attempt=$((attempt + 1))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Error: No se pudo conectar a la base de datos después de $max_attempts intentos"
    echo "🔍 Verifica que:"
    echo "   - Las variables de entorno estén configuradas correctamente"
    echo "   - La base de datos esté ejecutándose"
    echo "   - Las credenciales sean correctas"
    exit 1
fi

# Ejecutar migraciones si es necesario
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "🔄 Ejecutando migraciones..."
    npm run migration:run
fi

# Mostrar información del keep-alive
echo "🔄 Sistema de Keep-Alive configurado:"
echo "   - Keep-alive cada 30 minutos"
echo "   - Keep-alive diario a las 2:00 AM"
echo "   - Keep-alive cada 5 minutos en horario laboral (8:00-18:00, L-V)"
echo "   - Endpoints disponibles:"
echo "     * GET /health/database - Estado de la conexión"
echo "     * GET /keepalive - Ejecutar keep-alive manual"

# Iniciar la aplicación
echo "🎯 Iniciando aplicación NestJS..."
exec node dist/main.js
