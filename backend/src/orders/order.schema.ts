import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product' }) productId: Types.ObjectId;
  @Prop() name: string;
  @Prop() price: number;
  @Prop() quantity: number;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true }) orderNumber: string;
  @Prop({ required: true }) customerName: string;
  @Prop({ required: true }) phone: string;
  @Prop({ required: true }) town: string;
  @Prop({ type: [SchemaFactory.createForClass(OrderItem)] }) items: OrderItem[];
  @Prop({ required: true }) total: number;
  @Prop({ enum: ['new', 'confirmed', 'delivered', 'cancelled'], default: 'new' }) status: string;
}
export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);
