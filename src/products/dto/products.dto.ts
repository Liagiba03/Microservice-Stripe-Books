import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

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

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsPositive()
  price: number; // Precio en MXN, en formato de pesos

  @IsOptional()
  @IsString()
  currency: string = 'mxn'; // Moneda por defecto
}
