import 'reflect-metadata';
import { DataSource } from 'typeorm'; //DataSource là một class được sử dụng để thiết lập kết nối với cơ sở dữ liệu và quản lý các entity, repository, và các tính năng khác của TypeORM. Nó cung cấp một cách để cấu hình kết nối, định nghĩa các entity, và thực hiện các thao tác với cơ sở dữ liệu thông qua các repository hoặc query builder.
import * as dotenv from 'dotenv';

// load env giống ConfigModule
dotenv.config({ path: '.development.env' });

export const AppDataSource = new DataSource({ // cấu hình kết nối với cơ sở dữ liệu, trong đó type là loại cơ sở dữ liệu (ở đây là mysql), host là địa chỉ máy chủ cơ sở dữ liệu, port là cổng kết nối, username là tên đăng nhập, password là mật khẩu, database là tên cơ sở dữ liệu cần kết nối đến
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,

    // 👇 glob để khỏi import từng entity
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
});
