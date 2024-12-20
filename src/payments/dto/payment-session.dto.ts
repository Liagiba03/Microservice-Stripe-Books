import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNumber, IsPositive, IsString, ValidateNested } from "class-validator";

export class PaymentSessionDto {

    @IsString()
    customerId: string

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested() //También valida el método al que llama
    @Type(() => PaymentSessionItemDto)
    items : PaymentSessionItemDto[];
}

export class PaymentSessionItemDto {
    //Se crea un dto por cada información de endpoint que se va a recibir
    @IsString()
    productId: string;

    @IsNumber()
    @IsPositive()
    quantity: number;
}
