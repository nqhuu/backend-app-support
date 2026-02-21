import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { ResponseMessage } from 'src/decorator/customize';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ResponseMessage('Đăng nhập thành công')
  handleLogin(
    @Req() req,
    // set cookie cho trình duyệt từ server
    @Res({ passthrough: true }) res) { // @Res() res nếu không có { passthrough: true } thì sau khi set cookie xong sẽ trả về response luôn, không thể trả về dữ liệu khác được nữa
    return this.authService.login(req.user, res);
  }

  @Post('/logout/:id')
  handleLogout(
    @Req() req,
    @Res({ passthrough: true }) res
  ) {
    return this.authService.logout(req.params, res);
  }
  // @Post()
  // create(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
