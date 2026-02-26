import { Injectable } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import ms, { StringValue } from 'ms';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class TokensService {

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  createRefeshToken(payload: any) {
    const refreshExpire = this.configService.get<string>('JWT_REFRESH_EXPIRE');
    if (!refreshExpire) throw new Error('Missing JWT_REFRESH_EXPIRE');

    const expiresInMs = ms(refreshExpire as StringValue);
    if (typeof expiresInMs !== 'number') {
      throw new Error('Invalid JWT_REFRESH_EXPIRE format');
    }

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: expiresInMs / 1000,
    });
  }


  create(createTokenDto: CreateTokenDto) {
    return 'This action adds a new token';
  }

  findAll() {
    return `This action returns all tokens`;
  }

  findOne(id: number) {
    return `This action returns a #${id} token`;
  }

  update(id: number, updateTokenDto: UpdateTokenDto) {
    return `This action updates a #${id} token`;
  }

  remove(id: number) {
    return `This action removes a #${id} token`;
  }
}
