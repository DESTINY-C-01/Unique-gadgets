import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, IsIn, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @IsMongoId() productId: string;
  @IsInt() @Min(1) @Max(20) quantity: number;
}

export class CreateOrderDto {
  @IsString() @IsNotEmpty() @MaxLength(80) customerName: string;
  @Matches(/^[+\d][\d\s-]{6,19}$/, { message: 'Invalid phone number' }) phone: string;
  @IsString() @IsNotEmpty() @MaxLength(80) town: string;
  @IsOptional() @IsIn(['en', 'fr']) language?: string;
  @ValidateNested({ each: true }) @Type(() => OrderItemDto) @ArrayMinSize(1) @ArrayMaxSize(30) items: OrderItemDto[];
}

export class UpdateOrderStatusDto {
  @IsIn(['new', 'confirmed', 'delivered', 'cancelled']) status: string;
}
