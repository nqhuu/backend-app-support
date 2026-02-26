// enum là một kiểu dữ liệu đặc biệt trong TypeScript, 
// nó cho phép chúng ta định nghĩa một tập hợp các hằng số có tên, 
// giúp cho code trở nên dễ đọc và dễ bảo trì hơn, 
// thay vì phải sử dụng các giá trị nguyên hoặc chuỗi để đại diện cho các loại người dùng khác nhau, 
// chúng ta có thể sử dụng enum để định nghĩa rõ ràng các loại người dùng này
export enum UserType {
    TYPE_1 = 'employee',
    TYPE_2 = 'customer',
    TYPE_3 = 'admin',
    TYPE_4 = 'super-admin',
}

export const USER_TYPE_VALUES = Object.values(UserType); //chuyển enum thành mảng các giá trị để sử dụng trong validate DTO