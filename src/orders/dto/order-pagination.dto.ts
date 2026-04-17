import { IsEnum, IsOptional, IsPostalCode } from "class-validator";
import { PaginationDto } from "src/common";
import { OrderStatusList } from "../enum/order.enum";
import { OrderStatus } from "generated/prisma/enums";

export class OrderPaginationDto extends PaginationDto {
    @IsOptional()
    @IsEnum( OrderStatusList, {
        message: `status must be one of the following values: ${OrderStatusList.join(', ')}`
    })
    status: OrderStatus;
}