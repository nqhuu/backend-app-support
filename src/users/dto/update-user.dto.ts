import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TrimToNull } from 'src/decorator/customize';
import { USER_TYPE_VALUES } from 'src/common/enums/user-type.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @IsOptional()
    @IsString()
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @TrimToNull() // Sử dụng custom decorator TrimToNull để tự động trim và chuyển chuỗi rỗng thành null
    email?: string;

    @IsOptional()
    employeeId?: number;

    @IsNotEmpty({ message: 'Type không được để trống' })
    @IsIn(USER_TYPE_VALUES, { message: `Bạn cần chọn 1 trong các kiểu tài khoản sau: ${USER_TYPE_VALUES.join(', ')}` })
    type: string;
}
