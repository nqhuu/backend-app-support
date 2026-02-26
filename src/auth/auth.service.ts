import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/users/users.interface';
import { JwtService } from '@nestjs/jwt';
import ms, { StringValue } from 'ms';
import { RefreshTokensService } from 'src/refresh_tokens/refresh_tokens.service';
import { Response } from 'express';
import { TokensService } from 'src/tokens/tokens.service';



@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private refreshTokensService: RefreshTokensService,
    private tokensService: TokensService,
  ) { }

  // hàm validateUser sẽ được gọi trong LocalStrategy để kiểm tra xem username và password có hợp lệ hay không, nếu hợp lệ sẽ trả về thông tin user, nếu không hợp lệ sẽ trả về null
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
    try {
      const { id, username, email, role } = user;
      // payload là dữ liệu sẽ được mã hóa vào token, thường sẽ chứa thông tin về user như id, name, email, role,... để khi giải mã token ra có thể lấy được thông tin này mà không cần phải truy vấn database
      const payload = { // sub: user.id, // sub là subject, có thể đặt tên gì cũng được nhưng thường đặt là sub để dễ hiểu đây là id của user
        sub: "token login",
        iss: "from server",
        id,
        username,
        email,
        role
      };

      const refresh_token = this.tokensService.createRefeshToken(payload);
      // const refresh_token = this.createRefeshToken(payload);
      const hashRefreshToken = this.usersService.getHashPassword(refresh_token);

      await this.refreshTokensService.handleLogin(id, hashRefreshToken);

      // set refresh token vào cookie với 'key' là 'refresh_token' và giá trị là refresh_token
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true, // chỉ có server mới có thể truy cập cookie này
        maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE') as StringValue), // thơi gian sống của cookie
      })


      return {
        access_token: this.jwtService.sign(payload), // tạo access token dựa trên payload và secret đã cấu hình trong JwtStrategy
        user: {
          id,
          username,
          email,
          role
        }
      };
    } catch (error) {
      throw new BadRequestException();
    }

  }

  async logout(reqParams: Object, res: Response) {
    try {
      // khi logout thì sẽ xóa refresh token trong database để không cho phép sử dụng refresh token đó để lấy access token mới nữa, đồng thời xóa cookie refresh_token trên trình duyệt
      await this.refreshTokensService.handleLogout(reqParams); // set userId thành 0 và refreshToken thành rỗng để xóa refresh token trong database  

      res.clearCookie('refresh_token', {
        httpOnly: true, // chỉ có server mới có thể truy cập cookie này
        secure: false, // chỉ gửi cookie qua kết nối HTTPS, nếu đang phát triển trên localhost thì có thể để false, nhưng khi deploy lên production thì nên để true để tăng cường bảo mật
        // sameSite: 'strict', // chỉ gửi cookie khi request đến từ cùng một trang web, nếu để 'lax' thì sẽ gửi cookie khi request đến từ trang web khác nhưng chỉ khi người dùng tương tác với trang web đó (ví dụ: click vào link), nếu để 'none' thì sẽ gửi cookie khi request đến từ trang web khác mà không cần tương tác, nhưng khi để 'none' thì phải kết hợp với secure: true để đảm bảo an toàn, nếu không sẽ bị trình duyệt chặn vì lý do bảo mật
      }); // xóa cookie refresh_token trên trình duyệt

      return {
        message: 'Logout successful'
      };
    } catch (error) {
      throw new HttpException('Failed to process logout request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async refreshToken(req: any, res: Response) {
    try {
      const refreshToken = req.cookies['refresh_token']; // lấy refresh token từ cookie trên trình duyệt gửi lên
      if (!refreshToken) throw new UnauthorizedException();

      const newRefreshToken = await this.refreshTokensService.handleRefreshToken(refreshToken, res); // kiểm tra xem refresh token có hợp lệ hay không, nếu hợp lệ sẽ trả về thông tin token, nếu không hợp lệ sẽ trả về null

      return {
        ...newRefreshToken
      };
    } catch (error) {
      throw new BadRequestException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

  }

  // createRefeshToken(payload: any) {
  //   const refreshExpire = this.configService.get<string>('JWT_REFRESH_EXPIRE');
  //   if (!refreshExpire) throw new Error('Missing JWT_REFRESH_EXPIRE');

  //   const expiresInMs = ms(refreshExpire as StringValue);
  //   if (typeof expiresInMs !== 'number') {
  //     throw new Error('Invalid JWT_REFRESH_EXPIRE format');
  //   }

  //   return this.jwtService.sign(payload, {
  //     secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
  //     expiresIn: expiresInMs / 1000,
  //   });
  // }

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
