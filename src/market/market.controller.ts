import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MarketService } from './market.service';
import { PriceDto } from './dto/price.dto';
import { SymbolDto } from './dto/symbols.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('market')
@Controller('market')
export class MarketController {
  constructor(private marketService: MarketService) {}

  @Get('prices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener precios actuales de todas las criptomonedas soportadas' })
  @ApiResponse({ status: 200, description: 'Precios obtenidos exitosamente', type: [PriceDto] })
  async getCurrentPrices(): Promise<PriceDto[]> {
    return this.marketService.getCurrentPrices();
  }

  @Get('ticker/:symbol')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener datos detallados de un símbolo específico' })
  @ApiResponse({ status: 200, description: 'Datos del ticker obtenidos exitosamente', type: PriceDto })
  @ApiResponse({ status: 404, description: 'Símbolo no encontrado' })
  async getTicker(@Param('symbol') symbol: string): Promise<PriceDto> {
    return this.marketService.getTicker(symbol);
  }

  @Get('symbols')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener lista de símbolos disponibles para trading' })
  @ApiResponse({ status: 200, description: 'Símbolos obtenidos exitosamente', type: [SymbolDto] })
  async getSymbols(): Promise<SymbolDto[]> {
    return this.marketService.getSymbols();
  }

  @Get('test')
  @ApiOperation({ summary: 'Endpoint de prueba sin autenticación' })
  async testBinance(): Promise<any> {
    return this.marketService.getCurrentPrices();
  }
}
