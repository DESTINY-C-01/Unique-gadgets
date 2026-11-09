import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdminGuard } from '../common/admin.guard';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';
import { CreateOrderDto, UpdateOrderStatusDto } from './order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private s: OrdersService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post() create(@Body() d: CreateOrderDto) { return this.s.create(d); }

  @UseGuards(AdminGuard) @Get() list() { return this.s.list(); }

  @UseGuards(AdminGuard) @Patch(':id')
  setStatus(@Param('id', ParseObjectIdPipe) id: string, @Body() d: UpdateOrderStatusDto) { return this.s.setStatus(id, d.status); }
}
