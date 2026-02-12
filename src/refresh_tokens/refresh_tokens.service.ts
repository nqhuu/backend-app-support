import { Injectable } from '@nestjs/common';
import { CreateRefreshTokenDto } from './dto/create-refresh_token.dto';
import { UpdateRefreshTokenDto } from './dto/update-refresh_token.dto';
import { RefreshToken } from './entities/refresh_token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class RefreshTokensService {

  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>, // NestJS tự động cung cấp repository tại đây
    private readonly config: ConfigService, // NestJS tự động cung cấp repository tại đây

  ) { }

  create(createRefreshTokenDto: CreateRefreshTokenDto) {
    return 'This action adds a new refreshToken';
  }

  async updateUserToken(userId: number, refreshToken: string) {
    await this.refreshTokenRepository.update(
      { userId: userId },
      { refreshToken: refreshToken }
    );
  }

  findAll() {
    return `This action returns all refreshTokens`;
  }

  findOne(id: number) {
    return `This action returns a #${id} refreshToken`;
  }

  update(id: number, updateRefreshTokenDto: UpdateRefreshTokenDto) {
    return `This action updates a #${id} refreshToken`;
  }

  remove(id: number) {
    return `This action removes a #${id} refreshToken`;
  }
}
