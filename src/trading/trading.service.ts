import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { MarketService } from '../market/market.service';
import { User, Balance, Holding, Trade } from '../types/prisma.types';
import { BuyDto } from './dto/buy.dto';
import { SellDto } from './dto/sell.dto';
import { TradeResponseDto } from './dto/trade-response.dto';

@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);
  private readonly tradingFee = 0.001; // 0.1% fee

  constructor(
    private prisma: PrismaService,
    private marketService: MarketService,
  ) {}

  async buy(user: User, buyDto: BuyDto): Promise<TradeResponseDto> {
    const { symbol, quantity, price } = buyDto;
    const baseAsset = symbol.replace('USDT', '');
    
    // Obtener precio actual si no se especifica
    const currentPrice = price || await this.marketService.getCurrentPrice(symbol);
    const totalCost = quantity * currentPrice;
    const fee = totalCost * this.tradingFee;
    const totalWithFee = totalCost + fee;

    // Verificar balance suficiente
    const usdtBalance = await this.getUserBalance(user.id, 'USDT');
    if (usdtBalance < totalWithFee) {
      throw new BadRequestException('Balance insuficiente para realizar la compra');
    }

    // Actualizar balance de USDT
    await this.updateBalance(user.id, 'USDT', usdtBalance - totalWithFee);

    // Actualizar o crear holding
    await this.updateHolding(user.id, baseAsset, quantity, currentPrice);

    // Crear registro de trade
    const savedTrade = await this.prisma.trade.create({
      data: {
        userId: user.id,
        symbol,
        side: 'buy',
        quantity,
        price: currentPrice,
        total: totalCost,
        fee,
        executedAt: new Date(),
        orderId: null, // No hay orden asociada para trades directos
      },
    });

    // Obtener balance actualizado
    const updatedBalance = await this.getUserBalance(user.id, 'USDT');

    this.logger.log(`User ${user.id} bought ${quantity} ${symbol} at ${currentPrice}`);

    return {
      trade_id: savedTrade.id,
      symbol,
      side: 'buy',
      quantity,
      price: currentPrice,
      total: totalCost,
      fee,
      executed_at: savedTrade.executedAt,
      remaining_balance: updatedBalance,
    };
  }

  async sell(user: User, sellDto: SellDto): Promise<TradeResponseDto> {
    const { symbol, quantity, price } = sellDto;
    const baseAsset = symbol.replace('USDT', '');
    
    // Obtener precio actual si no se especifica
    const currentPrice = price || await this.marketService.getCurrentPrice(symbol);
    const totalValue = quantity * currentPrice;
    const fee = totalValue * this.tradingFee;
    const totalAfterFee = totalValue - fee;

    // Verificar que el usuario tenga suficientes holdings
    const holding = await this.getUserHolding(user.id, baseAsset);
    if (!holding || parseFloat(holding.quantity.toString()) < quantity) {
      throw new BadRequestException('No tienes suficientes holdings para realizar la venta');
    }

    // Actualizar balance de USDT
    const usdtBalance = await this.getUserBalance(user.id, 'USDT');
    await this.updateBalance(user.id, 'USDT', usdtBalance + totalAfterFee);

    // Actualizar holding
    const newQuantity = parseFloat(holding.quantity.toString()) - quantity;
    if (newQuantity <= 0) {
      await this.prisma.holding.delete({
        where: { id: holding.id }
      });
    } else {
      await this.prisma.holding.update({
        where: { id: holding.id },
        data: { quantity: newQuantity }
      });
    }

    // Crear registro de trade
    const savedTrade = await this.prisma.trade.create({
      data: {
        userId: user.id,
        symbol,
        side: 'sell',
        quantity,
        price: currentPrice,
        total: totalValue,
        fee,
        executedAt: new Date(),
        orderId: null, // No hay orden asociada para trades directos
      },
    });

    // Obtener balance actualizado
    const updatedBalance = await this.getUserBalance(user.id, 'USDT');

    this.logger.log(`User ${user.id} sold ${quantity} ${symbol} at ${currentPrice}`);

    return {
      trade_id: savedTrade.id,
      symbol,
      side: 'sell',
      quantity,
      price: currentPrice,
      total: totalValue,
      fee,
      executed_at: savedTrade.executedAt,
      remaining_balance: updatedBalance,
    };
  }

  private async getUserBalance(userId: number, currency: string): Promise<number> {
    const balance = await this.prisma.balance.findFirst({
      where: { userId, currency },
    });
    return balance ? parseFloat(balance.amount.toString()) : 0;
  }

  private async updateBalance(userId: number, currency: string, amount: number): Promise<void> {
    await this.prisma.balance.upsert({
      where: {
        userId_currency: {
          userId,
          currency,
        },
      },
      update: {
        amount,
      },
      create: {
        userId,
        currency,
        amount,
      },
    });
  }

  private async getUserHolding(userId: number, symbol: string): Promise<Holding | null> {
    return this.prisma.holding.findFirst({
      where: { userId, symbol },
    });
  }

  private async updateHolding(userId: number, symbol: string, quantity: number, price: number): Promise<void> {
    const existingHolding = await this.getUserHolding(userId, symbol);

    if (existingHolding) {
      // Calcular precio promedio ponderado
      const totalValue = (parseFloat(existingHolding.quantity.toString()) * parseFloat(existingHolding.avgPurchasePrice.toString())) + (quantity * price);
      const totalQuantity = parseFloat(existingHolding.quantity.toString()) + quantity;
      const avgPrice = totalValue / totalQuantity;

      await this.prisma.holding.update({
        where: { id: existingHolding.id },
        data: {
          quantity: totalQuantity,
          avgPurchasePrice: avgPrice,
        },
      });
    } else {
      await this.prisma.holding.create({
        data: {
          userId,
          symbol,
          quantity,
          avgPurchasePrice: price,
        },
      });
    }
  }
}
