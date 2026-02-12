import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// load env giống ConfigModule
dotenv.config({ path: '.development.env' });

export const AppDataSource = new DataSource({
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
