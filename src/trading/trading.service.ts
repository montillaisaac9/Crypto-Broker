import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketService } from '../market/market.service';
import { User } from '../entities/user.entity';
import { Balance } from '../entities/balance.entity';
import { Holding } from '../entities/holding.entity';
import { Trade } from '../entities/trade.entity';
import { BuyDto } from './dto/buy.dto';
import { SellDto } from './dto/sell.dto';
import { TradeResponseDto } from './dto/trade-response.dto';

@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);
  private readonly tradingFee = 0.001; // 0.1% fee

  constructor(
    @InjectRepository(Balance)
    private balancesRepository: Repository<Balance>,
    @InjectRepository(Holding)
    private holdingsRepository: Repository<Holding>,
    @InjectRepository(Trade)
    private tradesRepository: Repository<Trade>,
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
    const trade = this.tradesRepository.create({
      user_id: user.id,
      symbol,
      side: 'buy',
      quantity,
      price: currentPrice,
      total: totalCost,
      fee,
      executed_at: new Date(),
    });

    const savedTrade = await this.tradesRepository.save(trade);

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
      executed_at: savedTrade.executed_at,
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
    if (!holding || holding.quantity < quantity) {
      throw new BadRequestException('No tienes suficientes holdings para realizar la venta');
    }

    // Actualizar balance de USDT
    const usdtBalance = await this.getUserBalance(user.id, 'USDT');
    await this.updateBalance(user.id, 'USDT', usdtBalance + totalAfterFee);

    // Actualizar holding
    const newQuantity = holding.quantity - quantity;
    if (newQuantity <= 0) {
      await this.holdingsRepository.remove(holding);
    } else {
      holding.quantity = newQuantity;
      await this.holdingsRepository.save(holding);
    }

    // Crear registro de trade
    const trade = this.tradesRepository.create({
      user_id: user.id,
      symbol,
      side: 'sell',
      quantity,
      price: currentPrice,
      total: totalValue,
      fee,
      executed_at: new Date(),
    });

    const savedTrade = await this.tradesRepository.save(trade);

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
      executed_at: savedTrade.executed_at,
      remaining_balance: updatedBalance,
    };
  }

  private async getUserBalance(userId: number, currency: string): Promise<number> {
    const balance = await this.balancesRepository.findOne({
      where: { user_id: userId, currency },
    });
    return balance ? parseFloat(balance.amount.toString()) : 0;
  }

  private async updateBalance(userId: number, currency: string, amount: number): Promise<void> {
    const balance = await this.balancesRepository.findOne({
      where: { user_id: userId, currency },
    });

    if (balance) {
      balance.amount = amount;
      await this.balancesRepository.save(balance);
    } else {
      const newBalance = this.balancesRepository.create({
        user_id: userId,
        currency,
        amount,
      });
      await this.balancesRepository.save(newBalance);
    }
  }

  private async getUserHolding(userId: number, symbol: string): Promise<Holding | null> {
    return this.holdingsRepository.findOne({
      where: { user_id: userId, symbol },
    });
  }

  private async updateHolding(userId: number, symbol: string, quantity: number, price: number): Promise<void> {
    const existingHolding = await this.getUserHolding(userId, symbol);

    if (existingHolding) {
      // Calcular precio promedio ponderado
      const totalValue = (existingHolding.quantity * existingHolding.avg_purchase_price) + (quantity * price);
      const totalQuantity = existingHolding.quantity + quantity;
      const avgPrice = totalValue / totalQuantity;

      existingHolding.quantity = totalQuantity;
      existingHolding.avg_purchase_price = avgPrice;
      await this.holdingsRepository.save(existingHolding);
    } else {
      const newHolding = this.holdingsRepository.create({
        user_id: userId,
        symbol,
        quantity,
        avg_purchase_price: price,
      });
      await this.holdingsRepository.save(newHolding);
    }
  }
}
