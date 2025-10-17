import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MarketService } from '../market/market.service';
import { TradingService } from '../trading/trading.service';
import { User, Order, OrderType, OrderStatus, OrderSide, OrderTypeExplicit, OrderSideExplicit, OrderStatusExplicit } from '../types/prisma.types';

// Usar enums explícitos como respaldo para evitar problemas de runtime
const OrderTypeEnum = OrderType || OrderTypeExplicit;
const OrderSideEnum = OrderSide || OrderSideExplicit;
const OrderStatusEnum = OrderStatus || OrderStatusExplicit;
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private marketService: MarketService,
    private tradingService: TradingService,
  ) {}

  async createOrder(user: User, createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const { symbol, type, side, quantity, price } = createOrderDto;

    // Validar que el precio se proporcione para órdenes limit y stop-loss
    if ((type === OrderTypeEnum.LIMIT || type === OrderTypeEnum.STOP_LOSS) && !price) {
      throw new BadRequestException('El precio es requerido para órdenes limit y stop-loss');
    }

    // Crear la orden
    const savedOrder = await this.prisma.order.create({
      data: {
        userId: user.id,
        symbol,
        type,
        side,
        quantity,
        price,
        status: OrderStatusEnum.PENDING,
      },
    });

    // Si es una orden market, ejecutarla inmediatamente
    if (type === OrderTypeEnum.MARKET) {
      await this.executeMarketOrder(savedOrder, user);
    }

    return this.mapOrderToResponse(savedOrder);
  }

  async getUserOrders(userId: number): Promise<OrderResponseDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => this.mapOrderToResponse(order));
  }

  async getOrderById(orderId: number, userId: number): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return this.mapOrderToResponse(order);
  }

  async cancelOrder(orderId: number, userId: number): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    if (order.status !== OrderStatusEnum.PENDING) {
      throw new BadRequestException('Solo se pueden cancelar órdenes pendientes');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatusEnum.CANCELLED },
    });

    return this.mapOrderToResponse(updatedOrder);
  }

  // Ejecutar cada 10 segundos para monitorear órdenes pendientes
  @Cron(CronExpression.EVERY_10_SECONDS)
  async processPendingOrders(): Promise<void> {
    const pendingOrders = await this.prisma.order.findMany({
      where: { status: OrderStatusEnum.PENDING },
      include: { user: true },
    });

    for (const order of pendingOrders) {
      try {
        if (order.type === OrderTypeEnum.LIMIT) {
          await this.checkLimitOrder(order);
        } else if (order.type === OrderTypeEnum.STOP_LOSS) {
          await this.checkStopLossOrder(order);
        }
      } catch (error) {
        this.logger.error(`Error processing order ${order.id}:`, error.message);
      }
    }
  }

  private async executeMarketOrder(order: Order, user: User): Promise<void> {
    try {
      if (order.side === OrderSideEnum.BUY) {
        await this.tradingService.buy(user, {
          symbol: order.symbol,
          quantity: parseFloat(order.quantity.toString()),
        });
      } else {
        await this.tradingService.sell(user, {
          symbol: order.symbol,
          quantity: parseFloat(order.quantity.toString()),
        });
      }

      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatusEnum.FILLED,
          filledAt: new Date(),
        },
      });

      this.logger.log(`Market order ${order.id} executed successfully`);
    } catch (error) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatusEnum.CANCELLED },
      });
      this.logger.error(`Market order ${order.id} failed:`, error.message);
    }
  }

  private async checkLimitOrder(order: Order): Promise<void> {
    const currentPrice = await this.marketService.getCurrentPrice(order.symbol);
    
    let shouldExecute = false;
    
    if (order.side === OrderSideEnum.BUY && order.price && currentPrice <= parseFloat(order.price.toString())) {
      shouldExecute = true;
    } else if (order.side === OrderSideEnum.SELL && order.price && currentPrice >= parseFloat(order.price.toString())) {
      shouldExecute = true;
    }

    if (shouldExecute) {
      // Obtener el usuario para ejecutar la orden
      const user = await this.prisma.user.findUnique({ where: { id: order.userId } });
      if (user) {
        await this.executeMarketOrder(order, user);
      }
    }
  }

  private async checkStopLossOrder(order: Order): Promise<void> {
    const currentPrice = await this.marketService.getCurrentPrice(order.symbol);
    
    // Para stop-loss, solo se ejecuta si el precio baja del nivel especificado
    if (order.side === OrderSideEnum.SELL && order.price && currentPrice <= parseFloat(order.price.toString())) {
      // Obtener el usuario para ejecutar la orden
      const user = await this.prisma.user.findUnique({ where: { id: order.userId } });
      if (user) {
        await this.executeMarketOrder(order, user);
      }
    }
  }

  private mapOrderToResponse(order: Order): OrderResponseDto {
    return {
      id: order.id,
      symbol: order.symbol,
      type: order.type,
      side: order.side,
      quantity: parseFloat(order.quantity.toString()),
      price: order.price ? parseFloat(order.price.toString()) : null,
      status: order.status,
      created_at: order.createdAt,
      filled_at: order.filledAt,
    };
  }
}
