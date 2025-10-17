import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { MarketService } from '../market/market.service';
import { Balance, Holding, Trade } from '../types/prisma.types';
import { BalanceDto } from './dto/balance.dto';
import { HoldingDto } from './dto/holding.dto';
import { PortfolioSummaryDto } from './dto/portfolio-summary.dto';
import { TradeHistoryDto } from './dto/trade-history.dto';
import { PerformanceDto } from './dto/performance.dto';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    private prisma: PrismaService,
    private marketService: MarketService,
  ) {}

  async getPortfolioSummary(userId: number): Promise<PortfolioSummaryDto> {
    const balances = await this.getUserBalances(userId);
    const holdings = await this.getUserHoldings(userId);

    const totalPortfolioValue = balances.reduce((sum, balance) => sum + balance.usd_value, 0) +
      holdings.reduce((sum, holding) => sum + holding.current_value, 0);

    const totalUnrealizedPnl = holdings.reduce((sum, holding) => sum + holding.unrealized_pnl, 0);
    const totalUnrealizedPnlPercent = totalPortfolioValue > 0 ? (totalUnrealizedPnl / (totalPortfolioValue - totalUnrealizedPnl)) * 100 : 0;

    return {
      balances,
      holdings,
      total_portfolio_value: totalPortfolioValue,
      total_unrealized_pnl: totalUnrealizedPnl,
      total_unrealized_pnl_percent: totalUnrealizedPnlPercent,
    };
  }

  async getUserBalances(userId: number): Promise<BalanceDto[]> {
    const balances = await this.prisma.balance.findMany({
      where: { userId },
    });

    const balanceDtos: BalanceDto[] = [];

    for (const balance of balances) {
      let usdValue = parseFloat(balance.amount.toString());
      
      // Convertir a USD si no es USDT
      if (balance.currency !== 'USDT') {
        try {
          const currentPrice = await this.marketService.getCurrentPrice(`${balance.currency}USDT`);
          usdValue = parseFloat(balance.amount.toString()) * currentPrice;
        } catch (error) {
          this.logger.warn(`Could not get price for ${balance.currency}USDT`);
          usdValue = 0;
        }
      }

      balanceDtos.push({
        currency: balance.currency,
        amount: parseFloat(balance.amount.toString()),
        usd_value: usdValue,
      });
    }

    return balanceDtos;
  }

  async getUserHoldings(userId: number): Promise<HoldingDto[]> {
    const holdings = await this.prisma.holding.findMany({
      where: { userId },
    });

    const holdingDtos: HoldingDto[] = [];

    for (const holding of holdings) {
      try {
        const currentPrice = await this.marketService.getCurrentPrice(`${holding.symbol}USDT`);
        const currentValue = parseFloat(holding.quantity.toString()) * currentPrice;
        const totalCost = parseFloat(holding.quantity.toString()) * parseFloat(holding.avgPurchasePrice.toString());
        const unrealizedPnl = currentValue - totalCost;
        const unrealizedPnlPercent = totalCost > 0 ? (unrealizedPnl / totalCost) * 100 : 0;

        holdingDtos.push({
          symbol: holding.symbol,
          quantity: parseFloat(holding.quantity.toString()),
          avg_purchase_price: parseFloat(holding.avgPurchasePrice.toString()),
          current_price: currentPrice,
          current_value: currentValue,
          total_cost: totalCost,
          unrealized_pnl: unrealizedPnl,
          unrealized_pnl_percent: unrealizedPnlPercent,
        });
      } catch (error) {
        this.logger.warn(`Could not get price for ${holding.symbol}USDT`);
      }
    }

    return holdingDtos;
  }

  async getTradeHistory(userId: number, limit: number = 50): Promise<TradeHistoryDto[]> {
    const trades = await this.prisma.trade.findMany({
      where: { userId },
      orderBy: { executedAt: 'desc' },
      take: limit,
    });

    return trades.map(trade => ({
      id: trade.id,
      symbol: trade.symbol,
      side: trade.side,
      quantity: parseFloat(trade.quantity.toString()),
      price: parseFloat(trade.price.toString()),
      total: parseFloat(trade.total.toString()),
      fee: parseFloat(trade.fee.toString()),
      executed_at: trade.executedAt,
    }));
  }

  async getPerformance(userId: number): Promise<PerformanceDto> {
    const trades = await this.prisma.trade.findMany({
      where: { userId },
      orderBy: { executedAt: 'asc' },
    });

    const holdings = await this.getUserHoldings(userId);
    const balances = await this.getUserBalances(userId);

    // Calcular PnL realizado (basado en trades de venta)
    const sellTrades = trades.filter(trade => trade.side === 'sell');
    let totalRealizedPnl = 0;
    let totalRealizedCost = 0;

    for (const sellTrade of sellTrades) {
      // Buscar trades de compra correspondientes para calcular el costo
      const buyTrades = trades.filter(trade => 
        trade.symbol === sellTrade.symbol && 
        trade.side === 'buy' && 
        trade.executedAt < sellTrade.executedAt
      );

      if (buyTrades.length > 0) {
        const avgBuyPrice = buyTrades.reduce((sum, trade) => 
          sum + parseFloat(trade.price.toString()), 0) / buyTrades.length;
        
        const sellValue = parseFloat(sellTrade.total.toString());
        const buyCost = parseFloat(sellTrade.quantity.toString()) * avgBuyPrice;
        const realizedPnl = sellValue - buyCost;
        
        totalRealizedPnl += realizedPnl;
        totalRealizedCost += buyCost;
      }
    }

    // Calcular PnL no realizado (holdings actuales)
    const totalUnrealizedPnl = holdings.reduce((sum, holding) => sum + holding.unrealized_pnl, 0);
    const totalUnrealizedCost = holdings.reduce((sum, holding) => sum + holding.total_cost, 0);

    // Estadísticas de trades
    const totalTrades = trades.length;
    const winningTrades = sellTrades.filter(trade => {
      const buyTrades = trades.filter(bt => 
        bt.symbol === trade.symbol && 
        bt.side === 'buy' && 
        bt.executedAt < trade.executedAt
      );
      if (buyTrades.length > 0) {
        const avgBuyPrice = buyTrades.reduce((sum, bt) => 
          sum + parseFloat(bt.price.toString()), 0) / buyTrades.length;
        return parseFloat(trade.price.toString()) > avgBuyPrice;
      }
      return false;
    }).length;

    const losingTrades = sellTrades.length - winningTrades;
    const winRate = sellTrades.length > 0 ? (winningTrades / sellTrades.length) * 100 : 0;

    const totalPnl = totalRealizedPnl + totalUnrealizedPnl;
    const totalPnlPercent = (totalRealizedCost + totalUnrealizedCost) > 0 ? 
      (totalPnl / (totalRealizedCost + totalUnrealizedCost)) * 100 : 0;

    return {
      total_unrealized_pnl: totalUnrealizedPnl,
      total_unrealized_pnl_percent: totalUnrealizedCost > 0 ? (totalUnrealizedPnl / totalUnrealizedCost) * 100 : 0,
      total_realized_pnl: totalRealizedPnl,
      total_realized_pnl_percent: totalRealizedCost > 0 ? (totalRealizedPnl / totalRealizedCost) * 100 : 0,
      total_pnl: totalPnl,
      total_pnl_percent: totalPnlPercent,
      total_trades: totalTrades,
      winning_trades: winningTrades,
      losing_trades: losingTrades,
      win_rate: winRate,
    };
  }
}
