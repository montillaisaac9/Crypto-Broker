# Dockerfile optimizado para producción en Render
# Usar imagen oficial de Node.js Alpine para menor tamaño
FROM node:20-alpine AS base

# Instalar dumb-init para manejo correcto de señales
RUN apk add --no-cache dumb-init

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# ===========================================
# Dependencias de desarrollo
# ===========================================
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# ===========================================
# Build de la aplicación
# ===========================================
FROM base AS builder
RUN npm ci
    # Copiar archivos de configuración necesarios para el build
    COPY tsconfig*.json ./
    COPY nest-cli.json ./
    # Copiar schema de Prisma
    COPY prisma/ ./prisma/
    # Copiar código fuente
    COPY src/ ./src/
    # Generar cliente de Prisma
    RUN npx prisma generate
    RUN npm run build

# ===========================================
# Imagen de producción
# ===========================================
FROM base AS runner

# Configurar variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Copiar dependencias de producción
COPY --from=deps /app/node_modules ./node_modules

# Copiar aplicación compilada
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Cambiar ownership al usuario no-root
RUN chown -R nestjs:nodejs /app
USER nestjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Usar dumb-init como PID 1
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio
CMD ["node", "dist/main.js"]
