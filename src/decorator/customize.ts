import { SetMetadata } from '@nestjs/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Transform } from 'class-transformer';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true); //key:value . SetMetadata là hàm dùng để tạo decorator tùy chỉnh nó nhận vào 2 tham số là key và value

export const RESPONSE_MESSAGE = 'response_message';
export const ResponseMessage = (message: string) => //tạo custom decorator @ResponseMessage('message') để gán thông điệp trả về cho route handler
    SetMetadata(RESPONSE_MESSAGE, message);

export const User = createParamDecorator( //tạo custom decorator @User() để lấy thông tin user từ request
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);

export function TrimToNull() { //custom decorator để tự động trim chuỗi và chuyển chuỗi rỗng thành null
    return Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim() === ''
                ? null
                : value.trim()
            : value
    );
}
