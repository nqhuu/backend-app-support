import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { DepartmentsModule } from './departments/departments.module';
import { RefreshTokensModule } from './refresh_tokens/refresh_tokens.module';
import { AuthModule } from './auth/auth.module';
import { TokensModule } from './tokens/tokens.module';
import { EmployeesModule } from './employees/employees.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.development.env', //chỉ định file env để load biến môi trường
      isGlobal: true, //khiến ConfigModule trở thành module toàn cục, có thể sử dụng ở bất cứ đâu mà không cần import lại
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], //import ConfigModule để sử dụng ConfigService (import có thể ví như phòng ban nào đó trong công ty)
      inject: [ConfigService], //inject có thể ví như việc mời ai đó từ phòng ban vào họp. Ở đây ta mời ConfigService vào để sử dụng, tức là đưa (tiêm) ConfigService vào hàm useFactory bên dưới. inject ConfigService vào factory function bên dưới (cách sử dụng Dependency Injection áp dụng cho trường hợp async không phải là class)
      useFactory: (config: ConfigService) => ({ //useFactory có thể ví như việc tổ chức một cuộc họp, trong đó config là tham số đầu vào của cuộc họp, và object trả về là kết quả của cuộc họp. Ở đây useFactory sẽ trả về một object cấu hình cho TypeOrmModule, trong đó config.get<string>('DB_HOST') sẽ lấy giá trị của biến môi trường DB_HOST đã được load bởi ConfigModule ở trên để cấu hình kết nối với cơ sở dữ liệu
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true, // Tự động load tất cả các entity đã khai báo trong các module
        // synchronize: true, // chỉ DEV . TypeORM đọc entity và tự động tạo bảng tương ứng trong database nếu chưa tồn tại
        // logging: true, // bật log câu lệnh SQL để dễ dàng debug trong quá trình phát triển, khi deploy lên production thì nên tắt logging để tránh bị lộ thông tin nhạy cảm trong câu lệnh SQL như tên bảng, tên cột, v.v. đồng thời cũng giúp cải thiện hiệu suất của ứng dụng vì không phải ghi log câu lệnh SQL nữa
      }),
    }),
    UsersModule,
    DepartmentsModule,
    RefreshTokensModule,
    AuthModule,
    TokensModule,
    EmployeesModule,
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
