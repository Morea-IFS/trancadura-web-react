import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { SignupDto } from './dto/signup.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    res.cookie('token', result.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      // secure: true, // use em produção com HTTPS
    });
    return { access_token: result.access_token };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      // secure: true, // use em produção
    });
    return { message: 'Logout realizado com sucesso' };
  }
}
