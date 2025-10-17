import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DatabaseKeepAliveService {
  private readonly logger = new Logger(DatabaseKeepAliveService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Ejecuta una consulta simple para mantener la conexión activa
   * Se ejecuta cada 30 minutos
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async keepAlive() {
    try {
      // Ejecutar una consulta simple para mantener la conexión activa
      await this.dataSource.query('SELECT 1');
      this.logger.log('✅ Keep-alive ejecutado exitosamente');
    } catch (error) {
      this.logger.error('❌ Error en keep-alive:', error.message);
    }
  }

  /**
   * Ejecuta keep-alive diario más robusto
   * Se ejecuta todos los días a las 2:00 AM
   */
  @Cron('0 2 * * *')
  async dailyKeepAlive() {
    try {
      this.logger.log('🔄 Iniciando keep-alive diario...');
      
      // Ejecutar múltiples consultas para asegurar la conexión
      await this.dataSource.query('SELECT NOW()');
      await this.dataSource.query('SELECT version()');
      
      // Verificar el estado de la conexión
      const result = await this.dataSource.query('SELECT 1 as status');
      
      if (result && result[0]?.status === 1) {
        this.logger.log('✅ Keep-alive diario completado exitosamente');
      } else {
        this.logger.warn('⚠️ Keep-alive diario completado con advertencias');
      }
    } catch (error) {
      this.logger.error('❌ Error en keep-alive diario:', error.message);
      
      // Intentar reconectar si hay error
      try {
        await this.dataSource.destroy();
        await this.dataSource.initialize();
        this.logger.log('🔄 Reconexión a la base de datos exitosa');
      } catch (reconnectError) {
        this.logger.error('❌ Error al reconectar:', reconnectError.message);
      }
    }
  }

  /**
   * Ejecuta keep-alive cada 5 minutos durante horario laboral
   * Se ejecuta de lunes a viernes de 8:00 a 18:00
   */
  @Cron('*/5 8-18 * * 1-5')
  async businessHoursKeepAlive() {
    try {
      await this.dataSource.query('SELECT 1');
      this.logger.debug('💼 Keep-alive horario laboral ejecutado');
    } catch (error) {
      this.logger.error('❌ Error en keep-alive horario laboral:', error.message);
    }
  }

  /**
   * Método manual para ejecutar keep-alive
   */
  async manualKeepAlive(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      this.logger.log('✅ Keep-alive manual ejecutado exitosamente');
      return true;
    } catch (error) {
      this.logger.error('❌ Error en keep-alive manual:', error.message);
      return false;
    }
  }

  /**
   * Verifica el estado de la conexión
   */
  async checkConnection(): Promise<{
    isConnected: boolean;
    timestamp: string;
    error?: string;
  }> {
    try {
      const result = await this.dataSource.query('SELECT NOW() as current_time');
      return {
        isConnected: true,
        timestamp: result[0]?.current_time || new Date().toISOString(),
      };
    } catch (error) {
      return {
        isConnected: false,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}
