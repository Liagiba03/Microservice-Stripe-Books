import { IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsPositive()
  price: number; // Precio en MXN, en formato de pesos

  @IsString()
  currency: string = 'mxn'; // Moneda por defecto
}
