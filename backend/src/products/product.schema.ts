import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const CATEGORIES = ['pho', 'lap', 'desk', 'gad', 'acc'];

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true }) name: string;
  @Prop({ required: true, trim: true }) brand: string;
  @Prop() description?: string;
  /** [display, processor, RAM, storage] */
  @Prop({ type: [String], default: [] }) specs: string[];
  @Prop({ required: true, min: 0 }) price: number;
  @Prop({ min: 0 }) oldPrice?: number;
  @Prop({ required: true, enum: CATEGORIES }) category: string;
  @Prop({ default: '📦' }) emoji: string;
  @Prop({ enum: ['tested', 'new'], default: 'tested' }) condition: string;
  @Prop({ default: false }) bestSeller: boolean;
  @Prop({ default: true }) inStock: boolean;
  @Prop() image?: string;
}
export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);
