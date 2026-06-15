import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatusDto, RequestDto } from './dto';
import { RequestsDto } from './dto/requests.dto';

@Controller()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  @MessagePattern({ cmd: 'create' })
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern({ cmd: 'start' })
  startOrder(@Payload() requestsDto: RequestsDto) {
    return this.ordersService.startOrder(requestsDto);
  }

  @MessagePattern({ cmd: 'find_all' })
  findAll(@Payload() orderPaginationDto: OrderPaginationDto) {
    return this.ordersService.findAll(orderPaginationDto);
  }

  @MessagePattern({ cmd: 'find_one' })
  findOne(@Payload('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern({ cmd: 'change_status' })
  changeOrderStatus( @Payload() changeOrderStatusDto: ChangeOrderStatusDto ) {
    return this.ordersService.changeOrderStatus(changeOrderStatusDto);
  }
}
