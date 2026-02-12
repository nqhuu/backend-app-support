import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { ResponseMessage } from 'src/decorator/customize';

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
    @Res({ passthrough: true }) res: Response) {
    return this.authService.login(req.user, res);
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
