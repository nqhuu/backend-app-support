import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/decorator/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    // Reflector giúp lấy metadata đã set ở decorator
    constructor(private reflector: Reflector) {
        super();
    }

    // context: ExecutionContext chứa thông tin về request hiện tại
    // canActivate (là hàm có sẵn của NestJS Chuẩn của Guard, Bất kỳ class nào là Guard thì NestJS luôn gọi canActivate() trước)sẽ được luôn được gọi trước khi vào handler của route, nó quyết định có kiểm tra auth không
    // Ở đây nó đang kiểm tra xem route có được đánh dấu là public hay không, nếu có thì cho phép truy cập mà không cần kiểm tra token, nếu không có thì sẽ gọi đến canActivate() của AuthGuard('jwt') để kiểm tra token có hợp lệ hay không
    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [ //getAllAndOverride sẽ tìm kiếm metadata ở cả controller và handler, nếu có metadata ở handler sẽ lấy metadata đó, nếu không có sẽ lấy metadata ở controller, nếu cả 2 đều không có thì trả về undefined
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context); // gọi canActivate() của AuthGuard('jwt'). super ở đây sẽ gọi đến validate() của JwtStrategy để kiểm tra token có hợp lệ hay không, nếu hợp lệ sẽ trả về user, nếu không hợp lệ sẽ trả về lỗi UnauthorizedException
    }
    // handleRequest là hook của AuthGuard để xử lý kết quả Passport,
    // nó sẽ được gọi sau khi validate() của JwtStrategy đã được gọi, 
    // nó nhận 3 tham số err, user, info, 
    // nếu validate() trả về user thì handleRequest sẽ nhận được user, nếu validate() trả về lỗi thì handleRequest sẽ nhận được lỗi, 
    // nếu validate() trả về null thì handleRequest sẽ nhận được user là null
    handleRequest(err, user, info) {
        // You can throw an exception based on either "info" or "err" arguments
        if (err || !user) {
            throw err || new UnauthorizedException("Token không hợp lệ");
        }
        return user;
    }
}