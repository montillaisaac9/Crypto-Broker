import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TradingService } from './trading.service';
import { BuyDto } from './dto/buy.dto';
import { SellDto } from './dto/sell.dto';
import { TradeResponseDto } from './dto/trade-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('trading')
@Controller('trading')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TradingController {
  constructor(private tradingService: TradingService) {}

  @Post('buy')
  @ApiOperation({ summary: 'Comprar criptomoneda' })
  @ApiResponse({ status: 201, description: 'Compra realizada exitosamente', type: TradeResponseDto })
  @ApiResponse({ status: 400, description: 'Balance insuficiente o datos inválidos' })
  async buy(@Request() req, @Body() buyDto: BuyDto): Promise<TradeResponseDto> {
    return this.tradingService.buy(req.user, buyDto);
  }

  @Post('sell')
  @ApiOperation({ summary: 'Vender criptomoneda' })
  @ApiResponse({ status: 201, description: 'Venta realizada exitosamente', type: TradeResponseDto })
  @ApiResponse({ status: 400, description: 'Holdings insuficientes o datos inválidos' })
  async sell(@Request() req, @Body() sellDto: SellDto): Promise<TradeResponseDto> {
    return this.tradingService.sell(req.user, sellDto);
  }
}
