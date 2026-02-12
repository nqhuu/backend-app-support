import { Expose, Transform } from "class-transformer";

export class UserResponseDto {

    @Expose() // Đánh dấu chỉ lấy trường này khi chuyển đổi sang JSON
    id: number;

    @Expose()
    username: string;

    @Expose()
    email?: string;

    @Expose()
    employeeId?: number;

    @Expose()
    type: string;

    @Expose()
    lastLogin: Date;

    @Expose()
    deletedAt: Date;

    @Expose()
    createdAt: Date;

}
