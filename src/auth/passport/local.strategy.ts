import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super();
    }

    //hàm validate được passport tự động gọi khi có yêu cầu đăng nhập, nó nhận 2 tham số username và password
    // validate là hàm bắt buộc phải có khi kế thừa PassportStrategy, không thể đổi tên hàm này
    async validate(username: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(username, password);
        if (!user) {
            throw new UnauthorizedException("Sai tên đăng nhập hoặc mật khẩu");
        }
        return user; // thông tin user sẽ được gán vào req.user. passport tự động làm việc này
    }
}