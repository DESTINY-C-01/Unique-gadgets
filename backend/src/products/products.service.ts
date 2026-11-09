import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.schema';
import { CreateProductDto, UpdateProductDto } from './product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private model: Model<Product>) {}

  list(f: { category?: string; q?: string; bestSeller?: string }) {
    const filter: Record<string, any> = {};
    if (f.category && f.category !== 'all') filter.category = f.category;
    if (f.bestSeller === 'true') filter.bestSeller = true;
    if (f.q) filter.name = { $regex: f.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    return this.model.find(filter).sort({ createdAt: -1 }).lean();
  }
  async get(id: string) {
    const p = await this.model.findById(id).lean();
    if (!p) throw new NotFoundException();
    return p;
  }
  create(d: CreateProductDto) { return this.model.create(d); }
  async update(id: string, d: UpdateProductDto) {
    const p = await this.model.findByIdAndUpdate(id, d, { new: true });
    if (!p) throw new NotFoundException();
    return p;
  }
  async remove(id: string) {
    const p = await this.model.findByIdAndDelete(id);
    if (!p) throw new NotFoundException();
    return { deleted: true };
  }
}
