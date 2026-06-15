import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from 'src/prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ORDER_DETAIL_SERVICE, PRODUCT_SERVICE } from 'src/config/services';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
  imports: [
    ClientsModule.register([
      {
        name: PRODUCT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3001
        }
      }
    ]),
    ClientsModule.register([
      {
        name: ORDER_DETAIL_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3003
        }
      }
    ])
  ]
})
export class OrdersModule {}
