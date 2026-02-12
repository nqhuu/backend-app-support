export enum UserType {
    TYPE_1 = 'employee',
    TYPE_2 = 'customer',
    TYPE_3 = 'admin',
    TYPE_4 = 'super-admin',
}

export const USER_TYPE_VALUES = Object.values(UserType); //chuyển enum thành mảng các giá trị để sử dụng trong validate DTO