import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/users/users.interface';
import { JwtService } from '@nestjs/jwt';
import ms, { StringValue } from 'ms';
import { RefreshTokensService } from 'src/refresh_tokens/refresh_tokens.service';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private configService: ConfigService, // NestJS tự động cung cấp repository tại đây
    private jwtService: JwtService,
    private refreshTokensService: RefreshTokensService,
  ) { }

  //ussername/ pass là 2 tham số thư viện passport nó ném về
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const isValid = this.usersService.isValidPassword(password, user.password);
      if (isValid === true) {
        return user;
      }
    }
    return null;
  }

  async login(user: IUser, res: Response) {
    const { id, name, email, role } = user;
    const payload = {
      sub: "token login",
      iss: "from server",
      id,
      name,
      email,
      role
    };

    const refresh_token = this.createRefeshToken(payload);
    console.log({ refresh_token });

    await this.refreshTokensService.updateUserToken(id, refresh_token);

    // set refresh token vào cookie với 'key' là 'refresh_token' và giá trị là refresh_token
    // res.cookie('refresh_token', refresh_token, {
    //   httpOnly: true, // chỉ có server mới có thể truy cập cookie này
    //   maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE') as StringValue), // thơi gian sống của cookie
    // })


    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id,
        name,
        email,
        role
      }
    };
  }

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

  // create(createAuthDto: CreateAuthDto) {
  //   return 'This action adds a new auth';
  // }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
