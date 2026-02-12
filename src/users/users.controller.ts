import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { ConfigService } from '@nestjs/config';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UserResponseDto } from './dto/respones-user.dto';
import { plainToInstance } from 'class-transformer';
import type { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService, // NestJS tự động cung cấp repository tại đây

  ) { }

  @Post()
  @ResponseMessage('Tạo người dùng thành công')
  async create(
    @Body() createUserDto: CreateUserDto,
    @User() user: IUser,
  ) {
    return await this.usersService.create(createUserDto, user);
  }

  @Get()
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @User() user: IUser,
  ): Promise<Pagination<UserResponseDto>> { //chỉnh lại kiểu trả về thành Pagination<UserResponseDto>
    //kiểm tra và đặt lại giá trị limit nếu nó không hợp lệ
    // Nếu limit không được cung cấp hoặc không phải là số dương hoặc vượt quá giới hạn mặc định, nó sẽ được đặt về giá trị mặc định từ cấu hình hoặc 50
    // limit = limit > 0 && limit <= Number(this.config.get('LIMIT_DEFAULT')) ? limit : Number(this.config.get('LIMIT_DEFAULT')) || 50;
    // return this.usersService.findAll({
    //   page: Number(page),
    //   limit: Number(limit),
    //   route: '/users' //đường dẫn gốc cho phân trang, có thể dùng để tạo các link phân trang, đây là tùy chọn
    // });
    const options: IPaginationOptions = { //đối tượng tùy chọn phân trang, IPaginationOptions là kiểu được định nghĩa trong thư viện nestjs-typeorm-paginate
      page: Number(page) || 1,
      limit: limit = limit > 0 && limit <= Number(this.config.get('LIMIT_DEFAULT')) ? limit : Number(this.config.get('LIMIT_DEFAULT')) || 50,
      route: '/users', //đường dẫn gốc cho phân trang, có thể dùng để tạo các link phân trang, đây là tùy chọn
    };
    const result = await this.usersService.findAll(options, user);
    return {
      ...result,
      items: plainToInstance(
        // khi chạy hàm plainToInstance (hàm của class-transformer: plainToInstance(Class, data, options)) này
        // Chuyển object thường (plain object / entity)
        // thành instance của một class (DTO), 
        // nó sẽ tạo ra một mảng các đối tượng UserResponseDto từ mảng result.items, áp dụng @Expose() trong UserResponseDto, chỉ giữ lại các thuộc tính được đánh dấu bằng @Expose() trong class UserResponseDto
        UserResponseDto, // chuyển đổi từng đối tượng class User sang class UserResponseDto
        result.items, // mảng các đối tượng User cần chuyển đổi
        {
          excludeExtraneousValues: true, // chỉ chuyển đổi các thuộc tính được đánh dấu bằng @Expose()
        },
      ),
    };

  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @User() user: IUser,
  ): Promise<UserResponseDto> {
    const respones = await this.usersService.findOne(id, user);
    return plainToInstance(
      UserResponseDto,
      respones,
      {
        excludeExtraneousValues: true,
      }
    );
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật người dùng thành công')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return await this.usersService.update(id, updateUserDto, user);
  }

  @ResponseMessage('Bạn đã xóa người dùng thành công')
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @User() user: IUser
  ) {
    return await this.usersService.remove(id, user);
  }

  @Post(':id/restore')
  @ResponseMessage('Khôi phục người dùng thành công')
  async restore(
    @Param('id') id: number,
    @User() user: IUser
  ) {
    return await this.usersService.restore(id, user);
  }
}
