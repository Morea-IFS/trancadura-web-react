import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { SignupDto } from './dto/signup.dto';
import { Response } from 'express';
import { Roles } from './roles/roles.decorator';
import { RolesGuard } from './roles/roles.guard';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Roles('superuser', 'staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('signup')
  async signup(@Body() dto: SignupDto, @Req() req) {
    const requesterId = req.user.userId;

    const userRoles = await this.authService.getUserRoles(requesterId);
    const isSuperUser = userRoles.includes('superuser');

    // SUPERUSER pode cadastrar qualquer usuário
    if (isSuperUser) {
      return this.authService.signup(dto);
    }

    // STAFF precisa informar os labs no signup
    if (!dto.labs || dto.labs.length === 0) {
      throw new ForbiddenException(
        'Você precisa informar os laboratórios do novo usuário',
      );
    }

    // Verifica se o staff é staff nos labs enviados
    const allAuthorized = await Promise.all(
      dto.labs.map(async (lab) => {
        const userLab = await this.authService.getUserLab(
          requesterId,
          lab.labId,
        );
        return userLab?.isStaff === true;
      }),
    );

    if (allAuthorized.some((authorized) => !authorized)) {
      throw new ForbiddenException(
        'Você não tem permissão para adicionar usuários em um ou mais laboratórios informados',
      );
    }

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
      // secure: true,
    });
    return { access_token: result.access_token };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      // secure: true,
    });
    return { message: 'Logout realizado com sucesso' };
  }
}
