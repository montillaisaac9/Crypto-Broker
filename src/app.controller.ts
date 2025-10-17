import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { DatabaseKeepAliveService } from './common/services/database-keepalive.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly databaseKeepAliveService: DatabaseKeepAliveService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Mensaje de bienvenida de la API' })
  @ApiResponse({ status: 200, description: 'Mensaje de bienvenida', type: String })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Verificar estado general de la aplicación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de salud de la aplicación',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', example: 123.456 }
      }
    }
  })
  getHealth(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('health/database')
  @ApiOperation({ summary: 'Verificar estado de la conexión a la base de datos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de la conexión a la base de datos',
    schema: {
      type: 'object',
      properties: {
        isConnected: { type: 'boolean', example: true },
        timestamp: { type: 'string', format: 'date-time' },
        error: { type: 'string', example: null }
      }
    }
  })
  async getDatabaseHealth() {
    return await this.databaseKeepAliveService.checkConnection();
  }

  @Get('keepalive')
  @ApiOperation({ summary: 'Ejecutar keep-alive manual para la base de datos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultado del keep-alive manual',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Keep-alive ejecutado exitosamente' },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  async triggerKeepAlive() {
    const success = await this.databaseKeepAliveService.manualKeepAlive();
    return {
      success,
      message: success ? 'Keep-alive ejecutado exitosamente' : 'Error en keep-alive',
      timestamp: new Date().toISOString(),
    };
  }
}
