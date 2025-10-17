import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar filtro global de excepciones
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configurar CORS
  app.enableCors();

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Crypto Broker API')
    .setDescription(`
      API completa para un broker de criptomonedas con trading simulado.
      
      ## Características principales:
      - 🔐 **Autenticación JWT** - Sistema de registro y login seguro
      - 📊 **Datos de mercado** - Precios en tiempo real de criptomonedas
      - 💰 **Trading simulado** - Compra y venta de criptomonedas
      - 📋 **Gestión de órdenes** - Crear, consultar y cancelar órdenes
      - 💼 **Portfolio** - Seguimiento de balances y rendimiento
      - 📈 **WebSockets** - Datos de velas japonesas en tiempo real
      - 🔄 **Keep-alive** - Mantenimiento automático de conexiones
      
      ## Autenticación:
      La mayoría de endpoints requieren autenticación JWT. Usa el token Bearer en el header Authorization.
      
      ## WebSockets:
      Para datos en tiempo real, conecta a: \`ws://localhost:3000/chart\`
      
      ## Base de datos:
      Utiliza Supabase como base de datos principal con keep-alive automático.
    `)
    .setVersion('1.0.0')
    .setContact('Trading Exchange Team', 'https://github.com/trading-exchange', 'support@trading-exchange.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'JWT-auth'
    )
    .addServer('http://localhost:3000', 'Servidor de desarrollo')
    .addServer('https://your-render-app.onrender.com', 'Servidor de producción')
    .addTag('app', 'Endpoints generales de la aplicación')
    .addTag('auth', 'Autenticación y autorización')
    .addTag('market', 'Datos de mercado y precios')
    .addTag('trading', 'Operaciones de trading')
    .addTag('orders', 'Gestión de órdenes')
    .addTag('portfolio', 'Portfolio y balances')
    .addTag('websocket', 'Documentación de WebSockets')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 Documentación Swagger: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
