import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { Pagination, paginate, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { IUser } from './users.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // NestJS tự động cung cấp repository tại đây
    private readonly config: ConfigService, // NestJS tự động cung cấp repository tại đây

  ) { }

  getHashPassword = (password: string) => { // hàm tạo chuỗi băm từ mật khẩu raw
    const salt = genSaltSync(10);           // đây là số vòng băm
    const hash = hashSync(password, salt);  // tạo ra chuỗi băm từ mật khẩu và muối
    return hash;
  }

  isValidPassword(password: string, hash: string) { // hàm so sánh mật khẩu
    return compareSync(password, hash);     // so sánh mật khẩu với chuỗi băm, trả về true nếu khớp, ngược lại trả về false
  }

  findOneByUsername(username: string) {
    return this.userRepository.findOne({
      where: {
        username
      },
    });
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const hashedPassword = this.getHashPassword(createUserDto.password);
    const newUser = { ...createUserDto, password: hashedPassword };
    const checkUser = await this.userRepository.findOne({
      where: [ //kiểm tra username hoặc email đã tồn tại chưa
        { username: newUser.username },
        { email: newUser.email }
      ],
    });
    if (checkUser) {
      if (checkUser.email === newUser.email) {
        throw new BadRequestException('Email đã tồn tại'); //ném lỗi nếu email đã tồn tại bằng BadRequestException
      }
      throw new BadRequestException('Username đã tồn tại'); //ném lỗi nếu username đã tồn tại bằng BadRequestException
    }
    const createNewUser = await this.userRepository.save(newUser);
    const { password, ...result } = createNewUser; // loại bỏ trường password khỏi kết quả trả về
    return result;
  }

  // options: IPaginationOptions là một đối tượng chứa các tùy chọn phân trang như trang hiện tại, số mục trên mỗi trang, v.v. phan này do thư viện nestjs-typeorm-paginate cung cấp
  // Pagination<User> là kiểu trả về, đại diện cho một trang kết quả phân trang chứa các thực thể User. phần này do thư viện nestjs-typeorm-paginate cung cấp
  // Omit<User, 'password'> là một kiểu TypeScript sử dụng tiện ích Omit để tạo ra một kiểu mới từ User bằng cách loại bỏ trường password. Điều này đảm bảo rằng khi trả về dữ liệu người dùng, trường password sẽ không được bao gồm trong kết quả.
  // async findAll(options: IPaginationOptions): Promise<Pagination<Omit<User, 'password'>>> {
  async findAll(options: IPaginationOptions, user?: IUser): Promise<Pagination<User>> {
    const result = await paginate(this.userRepository, options,
      {
        // withDeleted: user ? user?.role === 'admin' ? true : false : false //nếu user tồn tại và role của nó là admin thì mới cho phép tìm cả user đã xóa mềm
        ...(user?.role === this.config.get('ADMIN_ROLE') && { withDeleted: true }), //nếu user tồn tại và role của nó là admin thì mới cho phép tìm cả user đã xóa mềm
      }
    );
    // let userFilnal = result.items.map((user) => {
    //   const { password, ...userWithoutPassword } = user;
    //   return userWithoutPassword;
    // });
    // return { ...result, items: userFilnal }; //nếu không có user nào thì trả về kết quả phân trang rỗng
    return result
  }




  async findOne(id: number, user: IUser): Promise<User> {
    const respones = await this.userRepository.findOne({
      where: {
        id,
      },
      // withDeleted: user ? user?.role === 'admin' ? true : false : false //nếu user tồn tại và role của nó là admin thì mới cho phép tìm cả user đã xóa mềm
      ...(user?.role === this.config.get('ADMIN_ROLE') && { withDeleted: true }), // tìm cả user đã xóa mềm
    });
    if (!respones) {
      throw new BadRequestException('Không tìm thấy người dùng'); //ném lỗi nếu không tìm thấy người dùng bằng BadRequestException
    }
    return respones;
  }

  async update(id: number, updateUserDto: UpdateUserDto, user: IUser) {
    let respones = await this.userRepository.findOneBy({ id });
    if (!respones) {
      throw new BadRequestException('Không tìm thấy người dùng'); //ném lỗi nếu không tìm thấy người dùng bằng BadRequestException
    }
    if (updateUserDto.email) {
      let userEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email }
      });
      if (userEmail && userEmail.id !== id) {
        throw new BadRequestException('Email đã tồn tại');
      }
    }
    return await this.userRepository.update(id, updateUserDto);
  }

  async remove(id: number, user: IUser) {
    const respones = await this.userRepository.softDelete(id);
    if (!respones) {
      throw new BadRequestException('Không tìm thấy người dùng'); //ném lỗi nếu không tìm thấy người dùng bằng BadRequestException
    }
    return respones;
  }

  async restore(id: number, user: IUser) {
    return this.userRepository.restore(id);
  }
}
