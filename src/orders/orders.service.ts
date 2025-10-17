import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MarketService } from '../market/market.service';
import { TradingService } from '../trading/trading.service';
import { User } from '../entities/user.entity';
import { Order, OrderType, OrderStatus } from '../entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private marketService: MarketService,
    private tradingService: TradingService,
  ) {}

  async createOrder(user: User, createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const { symbol, type, side, quantity, price } = createOrderDto;

    // Validar que el precio se proporcione para órdenes limit y stop-loss
    if ((type === OrderType.LIMIT || type === OrderType.STOP_LOSS) && !price) {
      throw new BadRequestException('El precio es requerido para órdenes limit y stop-loss');
    }

    // Crear la orden
    const order = this.ordersRepository.create({
      user_id: user.id,
      symbol,
      type,
      side,
      quantity,
      price,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Si es una orden market, ejecutarla inmediatamente
    if (type === OrderType.MARKET) {
      await this.executeMarketOrder(savedOrder, user);
    }

    return this.mapOrderToResponse(savedOrder);
  }

  async getUserOrders(userId: number): Promise<OrderResponseDto[]> {
    const orders = await this.ordersRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });

    return orders.map(order => this.mapOrderToResponse(order));
  }

  async getOrderById(orderId: number, userId: number): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, user_id: userId },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return this.mapOrderToResponse(order);
  }

  async cancelOrder(orderId: number, userId: number): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, user_id: userId },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Solo se pueden cancelar órdenes pendientes');
    }

    order.status = OrderStatus.CANCELLED;
    const updatedOrder = await this.ordersRepository.save(order);

    return this.mapOrderToResponse(updatedOrder);
  }

  // Ejecutar cada 10 segundos para monitorear órdenes pendientes
  @Cron(CronExpression.EVERY_10_SECONDS)
  async processPendingOrders(): Promise<void> {
    const pendingOrders = await this.ordersRepository.find({
      where: { status: OrderStatus.PENDING },
      relations: ['user'],
    });

    for (const order of pendingOrders) {
      try {
        if (order.type === OrderType.LIMIT) {
          await this.checkLimitOrder(order);
        } else if (order.type === OrderType.STOP_LOSS) {
          await this.checkStopLossOrder(order);
        }
      } catch (error) {
        this.logger.error(`Error processing order ${order.id}:`, error.message);
      }
    }
  }

  private async executeMarketOrder(order: Order, user: User): Promise<void> {
    try {
      if (order.side === 'buy') {
        await this.tradingService.buy(user, {
          symbol: order.symbol,
          quantity: order.quantity,
        });
      } else {
        await this.tradingService.sell(user, {
          symbol: order.symbol,
          quantity: order.quantity,
        });
      }

      order.status = OrderStatus.FILLED;
      order.filled_at = new Date();
      await this.ordersRepository.save(order);

      this.logger.log(`Market order ${order.id} executed successfully`);
    } catch (error) {
      order.status = OrderStatus.CANCELLED;
      await this.ordersRepository.save(order);
      this.logger.error(`Market order ${order.id} failed:`, error.message);
    }
  }

  private async checkLimitOrder(order: Order): Promise<void> {
    const currentPrice = await this.marketService.getCurrentPrice(order.symbol);
    
    let shouldExecute = false;
    
    if (order.side === 'buy' && currentPrice <= order.price) {
      shouldExecute = true;
    } else if (order.side === 'sell' && currentPrice >= order.price) {
      shouldExecute = true;
    }

    if (shouldExecute) {
      await this.executeMarketOrder(order, order.user);
    }
  }

  private async checkStopLossOrder(order: Order): Promise<void> {
    const currentPrice = await this.marketService.getCurrentPrice(order.symbol);
    
    // Para stop-loss, solo se ejecuta si el precio baja del nivel especificado
    if (order.side === 'sell' && currentPrice <= order.price) {
      await this.executeMarketOrder(order, order.user);
    }
  }

  private mapOrderToResponse(order: Order): OrderResponseDto {
    return {
      id: order.id,
      symbol: order.symbol,
      type: order.type,
      side: order.side,
      quantity: order.quantity,
      price: order.price,
      status: order.status,
      created_at: order.created_at,
      filled_at: order.filled_at,
    };
  }
}
