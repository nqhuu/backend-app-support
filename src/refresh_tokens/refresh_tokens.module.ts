import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokensService } from './refresh_tokens.service';
import { RefreshTokensController } from './refresh_tokens.controller';
import { RefreshToken } from './entities/refresh_token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken])], // import TypeOrmModule và đăng ký entity RefreshToken để NestJS có thể tự động cung cấp repository cho entity này tại các service
  controllers: [RefreshTokensController],
  providers: [RefreshTokensService],
  exports: [RefreshTokensService]
})
export class RefreshTokensModule { }
