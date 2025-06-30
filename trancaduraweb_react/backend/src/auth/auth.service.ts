import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    public prisma: PrismaService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(dto: LoginAuthDto) {
    const user =
      (await this.usersService.findByUsername(dto.username)) ||
      (await this.usersService.findByEmail(dto.username));

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      isStaff: user.isStaff,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(dto: SignupDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
      isActive: dto.isActive ?? true,
      isStaff: dto.isStaff ?? false,
    });

    const { password, ...userWithoutPassword } = newUser;

    const payload = {
      sub: newUser.id,
      username: newUser.username,
      email: newUser.email,
      isStaff: newUser.isStaff,
    };

    return {
      user: userWithoutPassword,
      access_token: this.jwtService.sign(payload),
    };
  }
}
