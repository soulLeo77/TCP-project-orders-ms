import { IsArray, ValidateNested } from "class-validator";
import { CreateOrderDetailDto } from "./create-order-detail.dto";
import { Type } from "class-transformer";


export class CreateOrdersDetailDto {

    @IsArray()
    @ValidateNested({ each: true })
    @Type( () => CreateOrderDetailDto )
    ordersDetail: CreateOrderDetailDto[]
}