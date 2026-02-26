import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { TransformInterceptor } from './core/transform.interceptor';
import { HttpExceptionFilter } from './core/http-exception.filter';
import { JwtAuthGuard } from './auth/jwt-auth.guard';


async function bootstrap() {
  // const app = await NestFactory.create(AppModule); 
  // dùng AppModule để khởi tạo ứng dụng NestJS
  const app = await NestFactory.create<NestExpressApplication>(AppModule); //Dùng NestExpressApplication khi bạn cần các tính năng Express

  //Lấy ConfigService để sử dụng biến môi trường, ConfigService được cung cấp bởi ConfigModule, 
  const configService = app.get(ConfigService);

  const reflector = app.get(Reflector); //dùng để lấy metadata đã gắn bởi Decorator

  // global guard để bảo vệ các route bằng jwt
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // Middleware chạy đâu tiên (nó sẽ được chạy trước Gard, Interceptor, Pipe, Controller...)
  app.enableCors(
    {
      "origin": true,
      "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "preflightContinue": false,
      "optionsSuccessStatus": 204,
      credentials: true,
    }
  );

  //Middleware: Đọc headers của request, tìm dòng Cookie, phân tích nó và gắn vào req.cookies
  app.use(cookieParser());

  //config versioning cho API api/v1/...
  app.setGlobalPrefix('api'); //thêm tiền tố /api vào đường dẫn API, thay cho việc cấu hình prefix phía dưới
  app.enableVersioning({
    type: VersioningType.URI, // thêm tiền tố /v vào đường dẫn API
    // prefix: 'api/v',//thêm tiền tố /api/v vào đường dẫn API thay vì chỉ /v, có thể set global prefix phía trên
    defaultVersion: ['1', '2'], //giá trị ngay sau /v thành /v1 hoặc /v2
  });

  // pipe sử dụng để validate dữ liệu đầu vào. Sử dụng nhiều trong DTO
  // app.useGlobalPipes(new ValidationPipe());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,   // BẮT BUỘC
      exceptionFactory: (errors) => {
        const messages = errors
          .map(err => Object.values(err.constraints || {}))
          .flat();

        return new BadRequestException(messages[0]);
      },
    }),
  );

  //  interceptor sử dụng để tranform dữ liệu đầu ra  --- cần viết class TransformInterceptor rồi mới dùng được (Injectable)
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  // exception filter để format error response
  app.useGlobalFilters(new HttpExceptionFilter(reflector));

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port ?? 3000);

}
bootstrap();
