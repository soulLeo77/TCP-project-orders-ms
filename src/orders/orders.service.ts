import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../prisma.service';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatusDto, RequestDto } from './dto';
import { ORDER_DETAIL_SERVICE, PRODUCT_SERVICE } from 'src/config/services';
import { firstValueFrom } from 'rxjs';
import { RequestsDto } from './dto/requests.dto';
import { CreateOrderDetailDto } from './dto/create-order-detail.dto';

@Injectable()
export class OrdersService {

  constructor(
    private readonly prisma: PrismaService,
    @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy,
    @Inject(ORDER_DETAIL_SERVICE) private readonly orderDetailsClient: ClientProxy
  ) {}

  create(createOrderDto: CreateOrderDto) {
    return this.prisma.order.create({
      data: createOrderDto,
    });
  }

  async startOrder( requestsDto: RequestsDto ) {
    const { requests } = requestsDto;

    const ids = requests.map( request => request.product_id );

    const products = await firstValueFrom(this.productsClient.send({ cmd: 'find_many_by_ids' }, { ids: ids }));

    if ( !products ) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Products not found',
      });
    }

    const productsCompleteData = products.reduce( ( acc, product ) => {
      const request = requests.find( r => r.product_id === product.id );

      if ( !request ) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `Product with id ${product.id} not found`,
        });
      }

      acc.push({
        ...product,
        quantity: request.quantity,
      });

      return acc;
    }, [] );

    const totalAmount: number = productsCompleteData.reduce( ( total, product ) => total + product.price * product.quantity, 0 );
    const totalItems: number = productsCompleteData.reduce( ( total, product ) => total + product.quantity, 0 );

    const orderDto = new CreateOrderDto();

    orderDto.totalAmount = totalAmount;
    orderDto.totalItems = totalItems;

    const order = await this.prisma.order.create({
      data: orderDto,
    });

    const ordersDetail = productsCompleteData.map( product => {
      const orderDetailDto = new CreateOrderDetailDto();

      orderDetailDto.orderId = order.id;
      orderDetailDto.productId = product.id;
      orderDetailDto.quantity = product.quantity;
      orderDetailDto.price = product.price;
      orderDetailDto.subtotal = product.price * product.quantity;
      orderDetailDto.productName = product.name;
      orderDetailDto.productAvailable = product.available;

      return orderDetailDto;
    });
    console.log(ordersDetail);

    const ordersDetailCreated = await firstValueFrom(
      this.orderDetailsClient.send({ cmd: 'create_many' }, { ordersDetail: ordersDetail })
    );
    console.log(ordersDetailCreated);

    if ( !ordersDetailCreated ) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error creating order details',
      });
    }

    return order;

  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const totalItems = await this.prisma.order.count({
      where: {
        status: orderPaginationDto.status,
      }
    });

    const currentPage = orderPaginationDto.page;
    const perPage = orderPaginationDto.limit;
    
    return {
      data: await this.prisma.order.findMany({
        skip: (currentPage - 1) * perPage,
        take: perPage,
        where: {
          status: orderPaginationDto.status,
        }
      }),
      meta: {
        total: totalItems,
        page: currentPage,
        lastPage: Math.ceil(totalItems / perPage)
      }
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: id },
    });

    if ( !order ) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`,
      })
    }

    return order;
  }

  async changeOrderStatus( changeOrderStatusDto: ChangeOrderStatusDto ) {
    const { id, status } = changeOrderStatusDto;

    const order = await this.findOne(id);

    if ( order.status === status ) {
      return order;
    }

    return this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: status,
      },
    })  
  }
  
}
