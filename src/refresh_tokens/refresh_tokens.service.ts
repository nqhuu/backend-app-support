import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateRefreshTokenDto } from './dto/create-refresh_token.dto';
import { UpdateRefreshTokenDto } from './dto/update-refresh_token.dto';
import { RefreshToken } from './entities/refresh_token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { DataSource } from 'typeorm';
import { TokensService } from 'src/tokens/tokens.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class RefreshTokensService {

  constructor(
    @InjectRepository(RefreshToken) // InjectRepository là một decorator được sử dụng để inject repository của entity RefreshToken vào trong service, giúp service có thể sử dụng các phương thức của repository để thực hiện các thao tác với cơ sở dữ liệu liên quan đến entity RefreshToken
    private readonly refreshTokenRepository: Repository<RefreshToken>, // NestJS tự động cung cấp repository tại đây
    private readonly config: ConfigService, // ConfigService là một service được cung cấp bởi @nestjs/config, nó giúp chúng ta truy cập vào các biến môi trường đã được load bởi ConfigModule, trong trường hợp này chúng ta sẽ sử dụng ConfigService để lấy giá trị của biến môi trường JWT_REFRESH_EXPIRE để cấu hình thời gian hết hạn cho refresh token
    private readonly dataSource: DataSource, // DataSource là một class được sử dụng để thiết lập kết nối với cơ sở dữ liệu và quản lý các entity, repository, và các tính năng khác của TypeORM. Nó cung cấp một cách để cấu hình kết nối, định nghĩa các entity, và thực hiện các thao tác với cơ sở dữ liệu thông qua các repository hoặc query builder. Ở đây chúng ta sẽ sử dụng DataSource để thực hiện transaction khi xử lý login để đảm bảo tính toàn vẹn của dữ liệu khi có nhiều thao tác liên quan đến refresh token cần thực hiện cùng lúc, ví dụ như tạo mới refresh token, thu hồi refresh token cũ, xóa refresh token cũ nếu đã có 2 refresh token, v.v.
    private tokensService: TokensService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,

  ) { }

  create(createRefreshTokenDto: CreateRefreshTokenDto) {
    return 'This action adds a new refreshToken';
  }

  async handleLogin(userId: number, refreshToken: string) {
    try {
      // nếu chưa có thì tạo mới
      await this.dataSource.transaction(async manager => { // sử dụng transaction để đảm bảo tính toàn vẹn của dữ liệu khi có nhiều thao tác liên quan đến refresh token cần thực hiện cùng lúc, ví dụ như tạo mới refresh token, thu hồi refresh token cũ, xóa refresh token cũ nếu đã có 2 refresh token, v.v. Nếu có lỗi xảy ra trong quá trình thực hiện các thao tác trong transaction thì tất cả các thao tác sẽ được rollback về trạng thái ban đầu để tránh dữ liệu bị lỗi hoặc không nhất quán
        const repository = manager.getRepository(RefreshToken); // sử dụng manager.getRepository để lấy repository của entity RefreshToken trong transaction, giúp chúng ta thực hiện các thao tác với cơ sở dữ liệu liên quan đến entity RefreshToken trong transaction
        const existingToken = await repository.find({
          where: { userId },
          order: { createdAt: 'ASC' }, // cũ → mới
        });
        if (existingToken.length === 0) {
          await repository.save({
            userId,
            refreshToken,
            isRevoked: false, // isRevoked sẽ được set thành true khi user logout hoặc khi refresh token bị nghi ngờ bị lộ, khi isRevoked là true thì sẽ không cho phép sử dụng refresh token đó để lấy access token mới nữa
            expiredAt: new Date(Date.now() + ms(this.config.get<string>('JWT_REFRESH_EXPIRE') as StringValue)), // set thời gian hết hạn cho refresh token, expiresAt sẽ được so sánh với thời gian hiện tại để kiểm tra xem refresh token đã hết hạn hay chưa
          });
          return;
        }

        const activeTokens = existingToken.find(token => !token.isRevoked); // tìm token chưa bị revoke để thu hồi token đó
        activeTokens && await repository.update(
          { id: activeTokens.id },
          {
            isRevoked: true, // isRevoked sẽ được set thành true khi user logout hoặc khi refresh token bị nghi ngờ bị lộ, khi isRevoked là true thì sẽ không cho phép sử dụng refresh token đó để lấy access token mới nữa
            expiredAt: new Date(Date.now()) // set thời gian hết hạn cho refresh token, expiredAt sẽ được so sánh với thời gian hiện tại để kiểm tra xem refresh token đã hết hạn hay chưa
          },// set thời gian hết hạn cho refresh token, expiresAt sẽ được so sánh với thời gian hiện tại để kiểm tra xem refresh token đã hết hạn hay chưa
        );


        if (existingToken.length >= 2) {

          // xóa token cũ nhất (token đầu tiên trong mảng existingToken) để chỉ giữ lại 1 token thôi
          await repository.delete({
            id: existingToken[0].id
          });
        }
        // sau đó tạo mới refresh token mới
        await repository.save({
          userId,
          refreshToken,
          isRevoked: false, // isRevoked sẽ được set thành true khi user logout hoặc khi refresh token bị nghi ngờ bị lộ, khi isRevoked là true thì sẽ không cho phép sử dụng refresh token đó để lấy access token mới nữa
          expiredAt: new Date(Date.now() + ms(this.config.get<string>('JWT_REFRESH_EXPIRE') as StringValue)), // set thời gian hết hạn cho refresh token, expiresAt sẽ được so sánh với thời gian hiện tại để kiểm tra xem refresh token đã hết hạn hay chưa
        });

      });

    } catch (error) {
      console.error('Error handling login:', error);
      return {
        success: false,
        message: 'Error handling login',
        error: error.message,
      };
    }
  }

  async handleLogout(reqParams: Object) {
    try {
      // khi logout thì sẽ xóa refresh token trong database để không cho phép sử dụng refresh token đó để lấy access token mới nữa, đồng thời xóa cookie refresh_token trên trình duyệt
      const token = await this.refreshTokenRepository.findOne({
        where: { userId: reqParams['id'], isRevoked: false }, // tìm token nào chưa bị revoke (thu hồi) để thu hồi token đó
      });

      if (!token) return;

      token && this.refreshTokenRepository.update( // sử dụng && để kiểm tra nếu tokenId tồn tại thì mới thực hiện update, nếu tokenId không tồn tại thì sẽ không thực hiện update để tránh lỗi
        { id: token.id }, // cần tìm id của refresh token
        {
          isRevoked: true,
          expiredAt: new Date()
        }
      );
    } catch (error) {
      // Throw HttpException để NestJS tự động bắt và trả về lỗi 500 cho client
      throw new HttpException('Failed to process logout request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async handleRefreshToken(refreshToken: string, res) {
    let payloadOld: any;
    try {
      payloadOld = await this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    };
    const { id, username, email, role } = payloadOld;
    const payload = { // sub: user.id, // sub là subject, có thể đặt tên gì cũng được nhưng thường đặt là sub để dễ hiểu đây là id của user
      sub: "token login",
      iss: "from server",
      id,
      username,
      email,
      role
    };
    const token = await this.refreshTokenRepository.findOne({
      where: { userId: id, isRevoked: false }, // tìm token nào chưa bị revoke (thu hồi) để thu hồi token đó
    });

    if (!token) throw new UnauthorizedException('Refresh token not found'); // nếu không tìm thấy token nào chưa bị revoke (thu hồi) thì sẽ trả về lỗi UnauthorizedException với message 'Refresh token not found'

    const isRefreshTokenValid = this.usersService.isValidPassword(refreshToken, token.refreshToken); // so sánh refresh token gửi lên với refresh token đã được hash và lưu trong database để kiểm tra xem refresh token có hợp lệ hay không, nếu hợp lệ sẽ trả về true, nếu không hợp lệ sẽ trả về false

    if (!isRefreshTokenValid) throw new UnauthorizedException('Invalid refresh token'); // nếu refresh token không hợp lệ thì sẽ trả về lỗi UnauthorizedException với message 'Invalid refresh token'

    if (token.expiredAt < new Date()) { // nếu token đã hết hạn thì sẽ không cho phép sử dụng refresh token đó để lấy access token mới nữa, đồng thời sẽ xóa token đó trong database để tránh bị lộ token cũ
      await this.refreshTokenRepository.update(
        { id: token.id },
        {
          isRevoked: true,
          expiredAt: new Date()
        }
      );
      return null;
    }

    const newRefreshToken = this.tokensService.createRefeshToken(payload); // tạo refresh token mới dựa trên payload,
    const hashRefreshToken = this.usersService.getHashPassword(newRefreshToken); // hash refresh token mới để lưu vào database, khi so sánh với refresh token gửi lên sẽ so sánh với refresh token đã được hash trong database để kiểm tra xem refresh token có hợp lệ hay không

    token && await this.refreshTokenRepository.update(
      { id: token.id },
      {
        isRevoked: false,
        refreshToken: hashRefreshToken,
        expiredAt: new Date(Date.now() + ms(this.config.get<string>('JWT_REFRESH_EXPIRE') as StringValue))
      }
    );

    // set refresh token vào cookie với 'key' là 'refresh_token' và giá trị là refresh_token
    res.cookie('refresh_token', newRefreshToken, {
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
