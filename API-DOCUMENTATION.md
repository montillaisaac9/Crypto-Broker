# 📚 Documentación Completa de la API

## 🎯 Resumen de Documentación Swagger

La API está completamente documentada en Swagger con todos los endpoints y WebSockets cubiertos.

### 📍 **Acceso a la Documentación**
- **Desarrollo**: `http://localhost:3000/api`
- **Producción**: `https://your-render-app.onrender.com/api`

## 🔍 **Controladores Documentados**

### ✅ **1. App Controller** (`/`)
- `GET /` - Mensaje de bienvenida
- `GET /health` - Estado general de la aplicación
- `GET /health/database` - Estado de la conexión a la base de datos
- `GET /keepalive` - Ejecutar keep-alive manual

### ✅ **2. Auth Controller** (`/auth`)
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión

### ✅ **3. Market Controller** (`/market`)
- `GET /market/prices` - Precios actuales de criptomonedas
- `GET /market/ticker/:symbol` - Datos detallados de un símbolo
- `GET /market/symbols` - Lista de símbolos disponibles
- `GET /market/test` - Endpoint de prueba (sin autenticación)

### ✅ **4. Trading Controller** (`/trading`)
- `POST /trading/buy` - Comprar criptomoneda
- `POST /trading/sell` - Vender criptomoneda

### ✅ **5. Orders Controller** (`/orders`)
- `POST /orders` - Crear nueva orden
- `GET /orders` - Obtener todas las órdenes del usuario
- `GET /orders/:id` - Obtener orden por ID
- `DELETE /orders/:id` - Cancelar orden

### ✅ **6. Portfolio Controller** (`/portfolio`)
- `GET /portfolio/summary` - Resumen completo del portfolio
- `GET /portfolio/balance` - Balances del usuario
- `GET /portfolio/holdings` - Holdings del usuario
- `GET /portfolio/history` - Historial de trades
- `GET /portfolio/performance` - Estadísticas de rendimiento

### ✅ **7. WebSocket Documentation** (`/websocket`)
- `GET /websocket/info` - Información sobre WebSockets disponibles
- `GET /websocket/examples` - Ejemplos de código para WebSockets

## 🔌 **WebSockets Documentados**

### **Chart Gateway** (`/chart`)
- **URL**: `ws://localhost:3000/chart`
- **Namespace**: `/chart`

#### **Eventos del Cliente:**
- `subscribe_chart` - Suscribirse a un chart
- `unsubscribe_chart` - Desuscribirse de un chart
- `get_subscriptions` - Obtener suscripciones activas
- `get_active_streams` - Obtener streams activos

#### **Eventos del Servidor:**
- `historical_data` - Datos históricos
- `subscription_confirmed` - Confirmación de suscripción
- `candlestick_update` - Actualización de vela en tiempo real
- `subscription_error` - Error en suscripción
- `unsubscription_confirmed` - Confirmación de desuscripción
- `unsubscription_error` - Error en desuscripción
- `client_subscriptions` - Suscripciones del cliente
- `active_streams` - Streams activos

## 🔐 **Autenticación**

### **JWT Bearer Token**
- **Tipo**: Bearer Token
- **Header**: `Authorization: Bearer <token>`
- **Nombre en Swagger**: `JWT-auth`

### **Endpoints que Requieren Autenticación:**
- Todos los endpoints de `/market` (excepto `/test`)
- Todos los endpoints de `/trading`
- Todos los endpoints de `/orders`
- Todos los endpoints de `/portfolio`
- Endpoints de monitoreo (`/health/database`, `/keepalive`)

### **Endpoints Públicos:**
- `GET /` - Mensaje de bienvenida
- `GET /health` - Estado general
- `POST /auth/register` - Registro
- `POST /auth/login` - Login
- `GET /market/test` - Prueba de mercado
- `GET /websocket/*` - Documentación de WebSockets

## 📊 **Características de la Documentación**

### ✅ **Configuración Completa**
- **Título**: Crypto Broker API
- **Versión**: 1.0.0
- **Descripción**: Detallada con características principales
- **Contacto**: Trading Exchange Team
- **Licencia**: MIT
- **Servidores**: Desarrollo y producción

### ✅ **Tags Organizados**
- `app` - Endpoints generales
- `auth` - Autenticación
- `market` - Datos de mercado
- `trading` - Trading
- `orders` - Órdenes
- `portfolio` - Portfolio
- `websocket` - WebSockets

### ✅ **Respuestas Documentadas**
- Códigos de estado HTTP
- Descripciones detalladas
- Esquemas de respuesta
- Ejemplos de datos
- Manejo de errores

### ✅ **WebSockets Especiales**
- Documentación completa de eventos
- Ejemplos de código (JavaScript y Python)
- Información de conexión
- Símbolos e intervalos soportados

## 🚀 **Cómo Usar la Documentación**

### **1. Acceder a Swagger UI**
```bash
# Desarrollo local
http://localhost:3000/api

# Producción
https://your-render-app.onrender.com/api
```

### **2. Autenticarse**
1. Usar `/auth/login` para obtener el token JWT
2. Hacer clic en "Authorize" en Swagger UI
3. Ingresar: `Bearer <tu-token-jwt>`

### **3. Probar Endpoints**
- Todos los endpoints son probables directamente desde Swagger
- Ejemplos de request/response incluidos
- Validación automática de datos

### **4. WebSockets**
- Ver documentación en `/websocket/info`
- Ejemplos de código en `/websocket/examples`
- Conectar a `ws://localhost:3000/chart`

## 📝 **Notas Importantes**

### **Variables de Entorno**
- La documentación se adapta automáticamente al entorno
- URLs de servidor configuradas para desarrollo y producción

### **Keep-Alive**
- Sistema automático documentado en `/health/database`
- Endpoint manual en `/keepalive`

### **Base de Datos**
- Configurada para Supabase
- Monitoreo de conexión incluido

## ✅ **Estado de Documentación**

| Componente | Estado | Cobertura |
|------------|--------|-----------|
| **Controladores REST** | ✅ Completo | 100% |
| **WebSockets** | ✅ Completo | 100% |
| **Autenticación** | ✅ Completo | 100% |
| **DTOs** | ✅ Completo | 100% |
| **Errores** | ✅ Completo | 100% |
| **Ejemplos** | ✅ Completo | 100% |

**🎉 La documentación está 100% completa y lista para producción.**
