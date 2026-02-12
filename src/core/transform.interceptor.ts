import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE } from 'src/decorator/customize';

export interface Response<T> {
    statusCode: number;
    message?: string;
    data: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    constructor(private reflector: Reflector) {

    }
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<Response<T>> {
        return next
            .handle() // cho phép chạy tiếp tục tới controller
            // transform dữ liệu đầu ra
            .pipe(
                map((data) => ({
                    statusCode: context.switchToHttp().getResponse().statusCode,
                    message: this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) || "", //lấy message từ metadata gắn bởi decorator tùy chỉnh @ResponseMessage
                    data: data
                })),
            );
    }
}