import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsEmpty, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { USER_TYPE_VALUES, UserType } from "src/common/enums/user-type.enum";
import { TrimToNull } from "src/decorator/customize";

export class CreateUserDto {

    @IsNotEmpty({ message: 'Username không được để trống' })
    @TrimToNull() // Sử dụng custom decorator TrimToNull để tự động trim và chuyển chuỗi rỗng thành null
    username: string;

    @IsOptional()
    @IsString()
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @TrimToNull() // Sử dụng custom decorator TrimToNull để tự động trim và chuyển chuỗi rỗng thành null
    email?: string;

    @IsNotEmpty({ message: 'Password không được để trống' })
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    password: string;

    @IsOptional()
    employeeId?: number;

    @IsNotEmpty({ message: 'Type không được để trống' })
    @IsIn(USER_TYPE_VALUES, { message: `Bạn cần chọn 1 trong các kiểu tài khoản sau: ${USER_TYPE_VALUES.join(', ')}` })
    type: string;

}
