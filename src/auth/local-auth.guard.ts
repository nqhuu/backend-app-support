import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// LocalAuthGuard sẽ được sử dụng trong controller để bảo vệ route đăng nhập, 
// nó sẽ gọi đến LocalStrategy 
// (nó sẽ xác định LocalStrategy đang nằm ở đâu bằng cách dựa vào tham số 'local' truyền vào AuthGuard, nó sẽ tìm đến LocalStrategy đã được đăng ký với trong PassportStrategy(Strategy) với strategy name 'local' để gọi hàm validate của LocalStrategy)
// để kiểm tra xem username và password có hợp lệ hay không, nếu hợp lệ sẽ trả về thông tin user, nếu không hợp lệ sẽ trả về lỗi UnauthorizedException
export class LocalAuthGuard extends AuthGuard('local') {
    // async canActivate(context: any): Promise<boolean> {
    //     console.log('LocalAuthGuard triggered');
    //     const request = context.switchToHttp().getRequest();
    //     console.log('Request body:', request.body);
    //     return super.canActivate(context) as Promise<boolean>;
    // }
}