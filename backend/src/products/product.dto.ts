import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { CATEGORIES } from './product.schema';

export class CreateProductDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() brand: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) specs?: string[];
  @IsInt() @Min(0) price: number;
  @IsOptional() @IsInt() @Min(0) oldPrice?: number;
  @IsIn(CATEGORIES) category: string;
  @IsOptional() @IsString() emoji?: string;
  @IsOptional() @IsIn(['tested', 'new']) condition?: string;
  @IsOptional() @IsBoolean() bestSeller?: boolean;
  @IsOptional() @IsBoolean() inStock?: boolean;
  @IsOptional() @IsString() image?: string;
}
export class UpdateProductDto extends PartialType(CreateProductDto) {}
