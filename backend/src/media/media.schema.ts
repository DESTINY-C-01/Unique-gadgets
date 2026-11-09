import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** Product photos uploaded from the admin page are stored in MongoDB, so they survive redeploys. */
@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true }) contentType: string;
  @Prop({ type: Buffer, required: true }) data: Buffer;
}
export const MediaSchema = SchemaFactory.createForClass(Media);
