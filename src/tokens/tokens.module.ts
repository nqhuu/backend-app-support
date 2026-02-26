import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: ms(configService.get<string>('JWT_ACCESS_EXPIRE') as StringValue) / 1000, // thời gian sống của access token, thường sẽ ngắn hơn thời gian sống của refresh token, expiresIn sẽ được so sánh với thời gian hiện tại để kiểm tra xem access token đã hết hạn hay chưa, ở đây đang chuyển đổi từ ms sang giây vì expiresIn nhận giá trị là giây, còn trong file .env đang để thời gian sống của token là chuỗi như '15m', '7d' nên cần phải chuyển đổi sang giây để sử dụng được trong expiresIn
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TokensController],
  providers: [TokensService],
  exports: [TokensService]
})
export class TokensModule { }
