import { UserService } from './user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from 'src/share/decorators/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RatingOrderDto } from './dto/order.dto';
import { RolesGuard } from 'src/share/guards/roles.guard';
import { Roles } from 'src/share/decorators/roles.decorator';
import { Role } from 'src/entities';
import { GetAllUserDto } from './dto/get-all-user.dto';
import uploadImage from '../../share/multer/uploader';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../../share/multer/multer-config';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Get('/info')
  getInfo(@GetUser() user) {
    return this.userService.getMe(user.id);
  }

  @Get('/all-user')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseGuards(JwtGuard)
  getAllUser(@Query() getAllUserDto: GetAllUserDto) {
    return this.userService.getAllUser(getAllUserDto);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
        name: { type: 'string', nullable: true },
        address: { type: 'string', nullable: true },
      },
    },
  })
  @UseGuards(JwtGuard)
  @Patch('/update')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async update(
    @GetUser() user,
    @Body() data: UpdateUserDto,
    @UploadedFile() image,
  ) {
    console.log(image);

    const linkImage = image ? await uploadImage(image) : '';
    data = linkImage ? { ...data, avatar: linkImage } : data;
    await this.userService.edit(user.id, data);
    return {
      success: true,
    };
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'get products nearest with address of user' })
  @UseGuards(JwtGuard)
  @Get('/product/nearest')
  async getNearestProduct(@GetUser() user) {
    const userProfile = await this.userService.findById(user.id);
    const address = userProfile.address;
    return this.productService.nearestProduct(address);
  }

  @Get('/discount/:storeId')
  getDisCountOfStore(@Param('storeId') storeId: string) {
    return this.userService.getDisCountOfStore(storeId);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'order products' })
  @UseGuards(JwtGuard)
  @Post('/order')
  async order(@GetUser() user, @Body() createOrderDto: CreateOrderDto) {
    const userProfile = await this.userService.findById(user.id);
    const address = userProfile.address;
    const res = await this.userService.order(user.id, createOrderDto);
    return res;
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'cancel order' })
  @UseGuards(JwtGuard)
  @Patch('/order/:orderId')
  async cancelOrder(@GetUser() user, @Param('orderId') orderId: string) {
    await this.userService.cancelOrder(user.id, orderId);
    return {
      success: true,
      message: 'cancel order successfully',
    };
  }

  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'rating order' })
  @ApiBody({
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          nullable: true,
        },
        content: { type: 'string', nullable: false },
        star: { type: 'number', nullable: false },
      },
    },
  })
  @UseGuards(JwtGuard)
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  @Post('/order/rating/:orderId')
  async ratingOrder(
    @GetUser() user,
    @Param('orderId') orderId: string,
    @Body() ratingOrderDto: RatingOrderDto,
    @UploadedFiles() images,
  ) {
    const linksImage = [];
    for (const image of images) {
      const link = await uploadImage(image.path);
      linksImage.push(link);
    }
    return await this.userService.ratingOrder(
      user.id,
      orderId,
      ratingOrderDto,
      linksImage,
    );
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'get history orders' })
  @UseGuards(JwtGuard)
  @Get('/order/history')
  async historyOrder(@GetUser() user) {
    return this.userService.historyOrder(user.id);
  }

  @Delete('/delete/:userId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseGuards(JwtGuard)
  async delete(@Param('userId') userId: string) {
    return this.userService.deleteUser(userId);
  }

  @Get('/store-details')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseGuards(JwtGuard)
  async getStoreDetails() {
    return this.userService.getStoreDetails();
  }

  @Patch('/store-details/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseGuards(JwtGuard)
  async editStoreDetails(
    @Param('id') id: string,
    @Body('isPayment') isPayment: boolean,
  ) {
    return this.userService.editStoreDetails(id, isPayment);
  }

  @Get('/notifications')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  getNotification(@GetUser() user) {
    return this.userService.getNotifications(user.id);
  }

  @Get('/admin')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseGuards(JwtGuard)
  async getAdmin() {
    return this.userService.getAdmin();
  }
}
