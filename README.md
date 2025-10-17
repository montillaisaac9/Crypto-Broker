### 🚀 Crypto Broker: Backend de Criptomonedas en Tiempo Real

[![Nest.js](https://img.shields.io/badge/Nest.js-Real--Time-blue.svg)](https://nestjs.com)
[![WebSockets](https://img.shields.io/badge/WebSockets-Live%20Trading-green.svg)](https://socket.io)
[![Docker](https://img.shields.io/badge/Docker-Deploy-orange.svg)](https://docker.com)
**Descripción del Proyecto**  
Crypto Broker es un backend robusto y escalable desarrollado en **Nest.js**, que simula un broker de criptomonedas en tiempo real. Este proyecto replica la funcionalidad de una plataforma de trading profesional, integrando **WebSockets** para reflejar actualizaciones instantáneas de precios, órdenes de compra/venta y balances de cartera. Ideal para portafolios de desarrolladores backend, demuestra habilidades avanzadas en arquitectura de microservicios, manejo de eventos en tiempo real y APIs seguras.

**Características Principales**  
| **Módulo** | **Descripción** | **Tecnologías** |
|------------|-----------------|-----------------|
| **API REST** | Gestión de usuarios, autenticación JWT, creación de órdenes y consulta de mercado. | Nest.js, TypeORM, PostgreSQL |
| **WebSockets** | Streaming en vivo de precios de criptos (BTC, ETH, etc.) con latencia <100ms; notificaciones push de trades ejecutados. | Socket.IO, RxJS |
| **Simulación de Mercado** | Motor interno que genera fluctuaciones realistas de precios basadas en algoritmos (media móvil + volatilidad aleatoria). | Node.js Cron Jobs |
| **Seguridad** | Rate limiting, validación de inputs, encriptación de datos sensibles. | @nestjs/jwt, Helmet |
| **Testing** | Cobertura 90%+ con pruebas unitarias e integrales. | Jest, Supertest |

**Arquitectura**  
- **Monorepo** con módulos desacoplados (Auth, Trading, Market, Notifications).  
- **Event-Driven**: Uso de `@nestjs/event-emitter` para sincronizar trades con WebSockets.  
- **Dockerizado** para despliegue fácil en AWS/Heroku.  
- **Escalabilidad**: Soporte para múltiples conexiones WebSocket simultáneas (hasta 1,000 usuarios simulados).

**Demo en Acción**  
Imagina un frontend conectado: al abrir la app, ves precios de BTC subiendo 2.3% en vivo ⬆️. Colocas una orden de compra por $500 ETH → **Trade ejecutado** via WebSocket en <50ms. Tu balance se actualiza instantáneamente: *+$245.67 profit*.  

**Habilidades Demostradas**  
- **Backend Avanzado**: Nest.js decorators, guards y pipes.  
- **Real-Time**: WebSockets bidireccionales con manejo de reconexiones.  
- **Datos**: ORM relacional + simulación de datos financieros.  
- **DevOps**: CI/CD con GitHub Actions, logs con Winston.  

**Repositorio**: [GitHub - CryptoBroker](https://github.com/tu-usuario/cryptobroker)  
**Live Demo**: [Heroku App](https://cryptobroker.herokuapp.com)  
**Tiempo de Desarrollo**: 3 semanas | **Líneas de Código**: 2,500+  

*Este proyecto destaca mi expertise en sistemas financieros distribuidos. ¡Conecta para discutir implementaciones reales! 🚀*  
