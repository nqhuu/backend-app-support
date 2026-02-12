import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { DepartmentsModule } from './departments/departments.module';
import { RefreshTokensModule } from './refresh_tokens/refresh_tokens.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.development.env', //chỉ định file env để load biến môi trường
      isGlobal: true, //khiến ConfigModule trở thành module toàn cục, có thể sử dụng ở bất cứ đâu mà không cần import lại
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], //import ConfigModule để sử dụng ConfigService (import có thể ví như phòng ban nào đó trong công ty)
      inject: [ConfigService], //inject có thể ví như việc mời ai đó từ phòng ban vào họp. Ở đây ta mời ConfigService vào để sử dụng, tức là đưa (tiêm) ConfigService vào hàm useFactory bên dưới. inject ConfigService vào factory function bên dưới (cách sử dụng Dependency Injection áp dụng cho trường hợp async không phải là class)
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true, // Tự động load tất cả các entity đã khai báo trong các module
        // synchronize: true, // chỉ DEV . TypeORM đọc entity và tự động tạo bảng tương ứng trong database nếu chưa tồn tại
        logging: true,
      }),
    }),
    UsersModule,
    DepartmentsModule,
    RefreshTokensModule,
    AuthModule,
    // TypeOrmModule.forRoot({
    //   type: 'mysql', // hoặc postgres
    //   host: 'localhost',
    //   port: 3306,
    //   username: 'root',
    //   password: '',
    //   database: 'jwt',
    //   autoLoadEntities: true, // Tự động load entity đã khai báo trong các module
    //   synchronize: true,// Tự động tạo bảng (chỉ dùng cho Dev)
    //   logging: true,// bật log câu lệnh SQL
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
