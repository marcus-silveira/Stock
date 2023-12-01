import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateStockOutputDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  product_id: number;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  date: Date;
}
