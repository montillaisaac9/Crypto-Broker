import { Controller, Get, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { PortfolioSummaryDto } from './dto/portfolio-summary.dto';
import { BalanceDto } from './dto/balance.dto';
import { HoldingDto } from './dto/holding.dto';
import { TradeHistoryDto } from './dto/trade-history.dto';
import { PerformanceDto } from './dto/performance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('portfolio')
@Controller('portfolio')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Obtener resumen completo del portfolio' })
  @ApiResponse({ status: 200, description: 'Resumen del portfolio obtenido exitosamente', type: PortfolioSummaryDto })
  async getPortfolioSummary(@Request() req): Promise<PortfolioSummaryDto> {
    return this.portfolioService.getPortfolioSummary(req.user.id);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Obtener balances del usuario' })
  @ApiResponse({ status: 200, description: 'Balances obtenidos exitosamente', type: [BalanceDto] })
  async getBalances(@Request() req): Promise<BalanceDto[]> {
    return this.portfolioService.getUserBalances(req.user.id);
  }

  @Get('holdings')
  @ApiOperation({ summary: 'Obtener holdings del usuario' })
  @ApiResponse({ status: 200, description: 'Holdings obtenidos exitosamente', type: [HoldingDto] })
  async getHoldings(@Request() req): Promise<HoldingDto[]> {
    return this.portfolioService.getUserHoldings(req.user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Obtener historial de trades' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de trades a retornar (default: 50)' })
  @ApiResponse({ status: 200, description: 'Historial de trades obtenido exitosamente', type: [TradeHistoryDto] })
  async getTradeHistory(
    @Request() req,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<TradeHistoryDto[]> {
    return this.portfolioService.getTradeHistory(req.user.id, limit || 50);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Obtener estadísticas de rendimiento' })
  @ApiResponse({ status: 200, description: 'Estadísticas de rendimiento obtenidas exitosamente', type: PerformanceDto })
  async getPerformance(@Request() req): Promise<PerformanceDto> {
    return this.portfolioService.getPerformance(req.user.id);
  }
}
