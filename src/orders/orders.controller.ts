import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva orden' })
  @ApiResponse({ status: 201, description: 'Orden creada exitosamente', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(req.user, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las órdenes del usuario' })
  @ApiResponse({ status: 200, description: 'Órdenes obtenidas exitosamente', type: [OrderResponseDto] })
  async getUserOrders(@Request() req): Promise<OrderResponseDto[]> {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener orden por ID' })
  @ApiResponse({ status: 200, description: 'Orden obtenida exitosamente', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  async getOrderById(@Request() req, @Param('id', ParseIntPipe) id: number): Promise<OrderResponseDto> {
    return this.ordersService.getOrderById(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar orden' })
  @ApiResponse({ status: 200, description: 'Orden cancelada exitosamente', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  @ApiResponse({ status: 400, description: 'No se puede cancelar la orden' })
  async cancelOrder(@Request() req, @Param('id', ParseIntPipe) id: number): Promise<OrderResponseDto> {
    return this.ordersService.cancelOrder(id, req.user.id);
  }
}
