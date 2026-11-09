import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../products/product.schema';
import { CreateOrderDto } from './order.dto';
import { Order } from './order.schema';

const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orders: Model<Order>,
    @InjectModel(Product.name) private products: Model<Product>,
    private cfg: ConfigService,
  ) {}

  async create(d: CreateOrderDto) {
    // Prices always come from the database, never from the browser.
    const found = await this.products.find({ _id: { $in: d.items.map((i) => i.productId) } }).lean();
    const byId = new Map(found.map((p) => [String(p._id), p]));
    const items = d.items.map((i) => {
      const p = byId.get(i.productId);
      if (!p || !p.inStock) throw new BadRequestException('A product in your cart is no longer available');
      return { productId: p._id, name: p.name, price: p.price, quantity: i.quantity };
    });
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const orderNumber = 'UG-' + Date.now().toString(36).toUpperCase();
    await this.orders.create({ orderNumber, customerName: d.customerName, phone: d.phone, town: d.town, items, total });

    const fr = d.language === 'fr';
    const text = [
      fr ? `Bonjour, commande ${orderNumber} :` : `Hello, order ${orderNumber}:`,
      ...items.map((i) => `- ${i.quantity} x ${i.name} (${fmt(i.price)})`),
      `Total: ${fmt(total)}`,
      `${d.customerName}, ${d.phone}, ${d.town}`,
    ].join('\n');
    const whatsappUrl = `https://wa.me/${this.cfg.getOrThrow('WHATSAPP_NUMBER')}?text=${encodeURIComponent(text)}`;
    return { orderNumber, total, whatsappUrl };
  }

  async setStatus(id: string, status: string) {
    const o = await this.orders.findByIdAndUpdate(id, { status }, { new: true });
    if (!o) throw new NotFoundException();
    return o;
  }

  list() { return this.orders.find().sort({ createdAt: -1 }).limit(100).lean(); }
}
