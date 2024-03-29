import { forwardRef, Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mailer/mailer.module';
import {
  NotificationsRepository,
  OrderRepository,
  ProductRepository,
  StoreDetailRepository,
  CategoryProductRepository,
  DiscountRepository,
  StoreRepository,
  OrderItemRepository
} from '../../repositories';
import { UserModule } from '../user/user.module';

@Module({
  providers: [StoreService],
  imports: [
    TypeOrmModule.forFeature([
      StoreRepository,
      ProductRepository,
      DiscountRepository,
      OrderRepository,
      StoreDetailRepository,
      NotificationsRepository,
      CategoryProductRepository,
      OrderItemRepository
    ]),
    MailModule,
    forwardRef(() => UserModule),
  ],
  controllers: [StoreController],
  exports: [StoreService],
})
export class StoreModule {}
