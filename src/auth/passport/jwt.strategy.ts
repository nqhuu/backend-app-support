import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/users/users.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) { // 'jwt' dựa vào việc import { ExtractJwt, Strategy } from 'passport-jwt';
    constructor(
        private configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // lấy token từ header Authorization với định dạng Bearer token, ví dụ: Authorization
            ignoreExpiration: false, // nếu token hết hạn sẽ trả về lỗi
            // secretOrKey: configService.get<string>("JWT_ACCESS_TOKEN_SECRET"), //get sẽ trả về undefined nếu không tìm thấy biến môi trường, nếu không tìm thấy
            // secretOrKey sẽ được sử dụng để giải mã token, nếu token đã bị sửa đổi hoặc hết hạn thì sẽ không giải mã được và trả về lỗi UnauthorizedException
            secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'), //getOrThrow sẽ ném lỗi nếu không tìm thấy biến môi trường, giúp tránh lỗi do quên set biến môi trường
        });
    }

    // validate() sẽ được gọi sau khi token đã được giải mã thành công, payload là dữ liệu đã được mã hóa trong token, nếu validate() trả về giá trị thì giá trị đó sẽ được gán cho req.user, nếu validate() trả về null hoặc throw lỗi thì sẽ trả về lỗi UnauthorizedException
    async validate(payload: IUser) {
        const { id, name, email, role } = payload;
        return {
            id,
            name,
            email,
            role
        };
    }
}