import { Module } from '@nestjs/common';
// import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]), //đăng ký entity User với TypeOrmModule trong UsersModule, đây là cách để TypeORM biết về entity này và có thể tạo bảng tương ứng trong database
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
