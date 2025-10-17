import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PriceDto } from './dto/price.dto';
import { SymbolDto } from './dto/symbols.dto';

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);
  private readonly binanceApiUrl = process.env.BINANCE_API_URL || 'https://api.binance.com/api/v3';
  private readonly supportedSymbols = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT',
    'XRPUSDT', 'DOTUSDT', 'MATICUSDT', 'LINKUSDT'
  ];

  private priceCache = new Map<string, { data: any; timestamp: number }>();
  private readonly cacheTimeout = 5000; // 5 segundos

  async getCurrentPrices(): Promise<PriceDto[]> {
    try {
      const response = await axios.get(`${this.binanceApiUrl}/ticker/24hr`);

      // Filtrar solo los símbolos que soportamos
      const filteredData = response.data.filter((ticker: any) => 
        this.supportedSymbols.includes(ticker.symbol)
      );

      return filteredData.map((ticker: any) => ({
        symbol: ticker.symbol,
        price: ticker.lastPrice,
        priceChange: ticker.priceChange,
        priceChangePercent: ticker.priceChangePercent,
        volume: ticker.volume,
        highPrice: ticker.highPrice,
        lowPrice: ticker.lowPrice,
      }));
    } catch (error) {
      this.logger.error('Error fetching current prices:', error.message);
      throw new Error('Error al obtener precios actuales');
    }
  }

  async getTicker(symbol: string): Promise<PriceDto> {
    const cacheKey = `ticker_${symbol}`;
    const cached = this.priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await axios.get(`${this.binanceApiUrl}/ticker/24hr`, {
        params: { symbol: symbol.toUpperCase() }
      });

      const ticker = response.data;
      const priceData = {
        symbol: ticker.symbol,
        price: ticker.lastPrice,
        priceChange: ticker.priceChange,
        priceChangePercent: ticker.priceChangePercent,
        volume: ticker.volume,
        highPrice: ticker.highPrice,
        lowPrice: ticker.lowPrice,
      };

      this.priceCache.set(cacheKey, { data: priceData, timestamp: Date.now() });
      return priceData;
    } catch (error) {
      this.logger.error(`Error fetching ticker for ${symbol}:`, error.message);
      throw new Error(`Error al obtener datos para ${symbol}`);
    }
  }

  async getSymbols(): Promise<SymbolDto[]> {
    try {
      const response = await axios.get(`${this.binanceApiUrl}/exchangeInfo`);
      const symbols = response.data.symbols
        .filter((symbol: any) => 
          this.supportedSymbols.includes(symbol.symbol) && 
          symbol.status === 'TRADING'
        )
        .map((symbol: any) => ({
          symbol: symbol.symbol,
          baseAsset: symbol.baseAsset,
          quoteAsset: symbol.quoteAsset,
          status: symbol.status,
          minQty: symbol.filters.find((f: any) => f.filterType === 'LOT_SIZE')?.minQty || '0',
          stepSize: symbol.filters.find((f: any) => f.filterType === 'LOT_SIZE')?.stepSize || '0',
          tickSize: symbol.filters.find((f: any) => f.filterType === 'PRICE_FILTER')?.tickSize || '0',
        }));

      return symbols;
    } catch (error) {
      this.logger.error('Error fetching symbols:', error.message);
      throw new Error('Error al obtener símbolos disponibles');
    }
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    const ticker = await this.getTicker(symbol);
    return parseFloat(ticker.price);
  }
}
