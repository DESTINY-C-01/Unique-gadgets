import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private s: ProductsService) {}

  @Get() list(@Query() q: { category?: string; q?: string; bestSeller?: string }) { return this.s.list(q); }
  @Get(':id') get(@Param('id', ParseObjectIdPipe) id: string) { return this.s.get(id); }

  @UseGuards(AdminGuard) @Post() create(@Body() d: CreateProductDto) { return this.s.create(d); }
  @UseGuards(AdminGuard) @Patch(':id')
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() d: UpdateProductDto) { return this.s.update(id, d); }
  @UseGuards(AdminGuard) @Delete(':id') remove(@Param('id', ParseObjectIdPipe) id: string) { return this.s.remove(id); }
}
