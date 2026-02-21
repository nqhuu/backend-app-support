import { Injectable } from '@nestjs/common';
import { CreateRefreshTokenDto } from './dto/create-refresh_token.dto';
import { UpdateRefreshTokenDto } from './dto/update-refresh_token.dto';
import { RefreshToken } from './entities/refresh_token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { UsersService } from 'src/users/users.service';
import { IUser } from 'src/users/users.interface';
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

  async handleLogin(userId: number, refreshToken: string) {
    // nếu chưa có thì tạo mới
    const existingToken = await this.refreshTokenRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' }, // cũ → mới
    });
    if (existingToken) {
      if (existingToken.length === 1) {
        if (!existingToken[0].isRevoked) {
          await this.refreshTokenRepository.update(
            { userId: userId },
            {
              isRevoked: true, // isRevoked sẽ được set thành true khi user logout hoặc khi refresh token bị nghi ngờ bị lộ, khi isRevoked là true thì sẽ không cho phép sử dụng refresh token đó để lấy access token mới nữa
              expiredAt: new Date(Date.now()) // set thời gian hết hạn cho refresh token, expiredAt sẽ được so sánh với thời gian hiện tại để kiểm tra xem refresh token đã hết hạn hay chưa
            },// set thời gian hết hạn cho refresh token, expiresAt sẽ được so sánh với thời gian hiện tại để kiểm tra xem refresh token đã hết hạn hay chưa
          );
        }

        await this.refreshTokenRepository.save({
          userId,
          refreshToken,
          isRevoked: false, // isRevoked sẽ được set thành true khi user logout hoặc khi refresh token bị nghi ngờ bị lộ, khi isRevoked là true thì sẽ không cho phép sử dụng refresh token đó để lấy access token mới nữa
          expiredAt: new Date(Date.now() + ms(this.config.get<string>('JWT_REFRESH_EXPIRE') as StringValue)), // set thời gian hết hạn cho refresh token, expiresAt sẽ được so sánh với thời gian hiện tại để kiểm tra xem refresh token đã hết hạn hay chưa
        });
      }
      if (existingToken.length === 2) {
        const isRevokedToken = existingToken.find(token => token.isRevoked === false); // kiểm tra xem có token nào chưa bị revoke (thu hồi) hay không
        console.log('isRevokedToken===>', isRevokedToken);
        if (isRevokedToken) {
          const tokenIds = existingToken.find(token => token.isRevoked === true); // tìm token nào có isRevoked === true để xóa, vì khi đã có 2 token thì sẽ có 1 token bị revoke và 1 token chưa bị revoke, nên mình sẽ xóa token nào bị revoke để chỉ giữ lại token chưa bị revoke thôi
          console.log('tokenIds===>', tokenIds);
          if (tokenIds) {
            await this.refreshTokenRepository.delete({ // xóa token nào bị revoke để chỉ giữ lại token chưa bị revoke thôi
              id: tokenIds.id
            });
          }
          await this.refreshTokenRepository.update( // update token nào chưa bị revoke để set isRevoked thành true và expiredAt thành thời gian hiện tại để thu hồi token đó
            { id: isRevokedToken.id },
            {
              isRevoked: true, // isRevoked sẽ được set thành true khi user logout hoặc khi refresh token bị nghi ngờ bị lộ, khi isRevoked là true thì sẽ không cho phép sử dụng refresh token đó để lấy access token mới nữa
              expiredAt: new Date()
            }
          );
          await this.refreshTokenRepository.save({
            userId,
            refreshToken,
            isRevoked: false, // isRevoked sẽ được set thành true khi user logout hoặc khi refresh token bị nghi ngờ bị lộ, khi isRevoked là true thì sẽ không cho phép sử dụng refresh token đó để lấy access token mới nữa
            expiredAt: new Date(Date.now() + ms(this.config.get<string>('JWT_REFRESH_EXPIRE') as StringValue)), // set thời gian hết hạn cho refresh token, expiresAt sẽ được so sánh với thời gian hiện tại để kiểm tra xem refresh token đã hết hạn hay chưa
          });
        } else {
          await this.refreshTokenRepository.delete({ // xóa token nào bị revoke để chỉ giữ lại token chưa bị revoke thôi
            id: existingToken[0].id
          });
          await this.refreshTokenRepository.save({
            userId,
            refreshToken,
            isRevoked: false, // isRevoked sẽ được set thành true khi user logout hoặc khi refresh token bị nghi ngờ bị lộ, khi isRevoked là true thì sẽ không cho phép sử dụng refresh token đó để lấy access token mới nữa
            expiredAt: new Date(Date.now() + ms(this.config.get<string>('JWT_REFRESH_EXPIRE') as StringValue)), // set thời gian hết hạn cho refresh token, expiresAt sẽ được so sánh với thời gian hiện tại để kiểm tra xem refresh token đã hết hạn hay chưa
          });
        }
        // await this.refreshTokenRepository.update(
        //   { userId: userId },
        //   {
        //     refreshToken: refreshToken,
        //     isRevoked: false, // isRevoked sẽ được set thành true khi user logout hoặc khi refresh token bị nghi ngờ bị lộ, khi isRevoked là true thì sẽ không cho phép sử dụng refresh token đó để lấy access token mới nữa
        //     expiredAt: new Date(Date.now() + ms(this.config.get<string>('JWT_REFRESH_EXPIRE') as StringValue))
        //   },// set thời gian hết hạn cho refresh token, expiresAt sẽ được so sánh với thời gian hiện tại để kiểm tra xem refresh token đã hết hạn hay chưa
        // );
      }
    } else {
      await this.refreshTokenRepository.save({
        userId,
        refreshToken,
        isRevoked: false, // isRevoked sẽ được set thành true khi user logout hoặc khi refresh token bị nghi ngờ bị lộ, khi isRevoked là true thì sẽ không cho phép sử dụng refresh token đó để lấy access token mới nữa
        expiredAt: new Date(Date.now() + ms(this.config.get<string>('JWT_REFRESH_EXPIRE') as StringValue)), // set thời gian hết hạn cho refresh token, expiresAt sẽ được so sánh với thời gian hiện tại để kiểm tra xem refresh token đã hết hạn hay chưa
      });
    }
  }

  async handleLogout(reqParams: Object) {
    // khi logout thì sẽ xóa refresh token trong database để không cho phép sử dụng refresh token đó để lấy access token mới nữa, đồng thời xóa cookie refresh_token trên trình duyệt
    const tokenId = await this.refreshTokenRepository.findOne({
      where: { userId: reqParams['id'], isRevoked: false }, // tìm token nào chưa bị revoke (thu hồi) để thu hồi token đó
    });

    console.log('tokenId===>', tokenId);
    tokenId && this.refreshTokenRepository.update( // sử dụng && để kiểm tra nếu tokenId tồn tại thì mới thực hiện update, nếu tokenId không tồn tại thì sẽ không thực hiện update để tránh lỗi
      { id: tokenId.id }, // cần tìm id của refresh token
      {
        isRevoked: true,
        expiredAt: new Date()
      }
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
