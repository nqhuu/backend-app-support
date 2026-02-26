import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokensService } from './refresh_tokens.service';
import { RefreshTokensController } from './refresh_tokens.controller';
import { RefreshToken } from './entities/refresh_token.entity';
import { TokensModule } from 'src/tokens/tokens.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';

@Module({
  imports: [TokensModule, UsersModule,
    JwtModule.registerAsync({ // sử dụng JwtModule.registerAsync để có thể inject ConfigService vào trong JwtModule để lấy secret và expiresIn từ file .env
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({ // cấu hình JwtModule với secret và expiresIn lấy từ file .env thông qua ConfigService
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: ms(configService.get<string>('JWT_ACCESS_EXPIRE') as StringValue) / 1000, // thời gian sống của access token, thường sẽ ngắn hơn thời gian sống của refresh token, expiresIn sẽ được so sánh với thời gian hiện tại để kiểm tra xem access token đã hết hạn hay chưa, ở đây đang chuyển đổi từ ms sang giây vì expiresIn nhận giá trị là giây, còn trong file .env đang để thời gian sống của token là chuỗi như '15m', '7d' nên cần phải chuyển đổi sang giây để sử dụng được trong expiresIn
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([RefreshToken])], // import TypeOrmModule và đăng ký entity RefreshToken để NestJS có thể tự động cung cấp repository cho entity này tại các service
  controllers: [RefreshTokensController],
  providers: [RefreshTokensService],
  exports: [RefreshTokensService]
})
export class RefreshTokensModule { }
