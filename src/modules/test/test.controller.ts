import { TestService } from './test.service';
import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/entities';
import { Roles } from 'src/share/decorators/roles.decorator';
import { RolesGuard } from 'src/share/guards/roles.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from 'src/share/decorators/get-user.decorator';

@ApiTags('Test')
@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('/')
  getTests() {
    return this.testService.getTests();
  }

  @Get('/report')
  async getFunctionResults() {
    return this.testService.getFunctionResult();
  }

  @Get('/order/detail/:orderId')
  async getOrderDetail(@Param('orderId') orderId: string) {
    return this.testService.getOrderDetail(orderId);
  }

  @Get('/admin/order/report')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseGuards(JwtGuard)
  async getOrderReportByAdmin(@Query('month') month: number) {
    return this.testService.getOrderReportByAdmin(month);
  }

  @Get('/store/order/report')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Store)
  @UseGuards(JwtGuard)
  async getOrderReportByStore(@Query('month') month: number, @GetUser() store) {
    return this.testService.getOrderReportByStore(month, store.id);
  }

  @Get('/rating/detail/:orderId')
  async getRatingDetail(@Param('orderId') orderId: string) {
    return this.testService.getRatingDetailByOrderId(orderId);
  }

  @Get('/order/all')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseGuards(JwtGuard)
  async getAllOrders(
    @Query('pagenumber') pagenumber: number,
    @Query('pagesize') pagesize: number,
  ) {
    return this.testService.getAllOrders(pagenumber, pagesize);
  }

  @Get('/notification/store')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Store)
  @UseGuards(JwtGuard)
  async getNotificationByStore(@GetUser() store) {
    return this.testService.getNotificationByStore(store.id);
  }

  @Get('/notification/admin')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseGuards(JwtGuard)
  async getNotificationByAdmin(@GetUser() admin) {
    return this.testService.getNotificationByUser(admin.id);
  }

  @Get('/notification/user')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.User)
  @UseGuards(JwtGuard)
  async getNotificationByUser(@GetUser() user) {
    return this.testService.getNotificationByUser(user.id);
  }

  @Patch('/notification/:notificationId')
  async updateNoti(@Param('notificationId') notificationId: string) {
    return this.testService.updateNoti(notificationId);
  }
}
