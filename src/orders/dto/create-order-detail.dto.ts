import { IsUUID, IsInt, Min, IsNumber, IsBoolean, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateOrderDetailDto {
    @IsUUID()
    orderId: string

    @IsInt()
    @Min(1)
    productId: number

    @IsInt()
    @Min(1)
    quantity: number

    @IsNumber({
        maxDecimalPlaces: 4
    })
    @Min(0)
    @Type( () => Number )
    price: number

    @IsNumber({
        maxDecimalPlaces: 4
    })
    @Min(0)
    @Type( () => Number )
    subtotal: number

    @IsString()
    productName: string

    @IsBoolean()
    productAvailable: boolean
}
