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
      
    const roles = await this.prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true },
    });
    const roleNames = roles.map((r) => r.role.name);

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: roleNames, // Adiciona os roles ao payload
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
    });

    if (dto.labIds?.length) {
      // Buscar labs existentes no banco
      const existingLabs = await this.prisma.lab.findMany({
        where: { id: { in: dto.labIds } },
        select: { id: true },
      });

      const existingLabIds = existingLabs.map((lab) => lab.id);

      // Verificar se há algum labId inválido
      const invalidLabIds = dto.labIds.filter((id) => !existingLabIds.includes(id));
      if (invalidLabIds.length > 0) {
        throw new ConflictException(
          `Os seguintes labs não existem: ${invalidLabIds.join(', ')}`
        );
      }

      // Criar as relações user-lab
      const createManyData = dto.labIds.map((labId) => ({
        userId: newUser.id,
        labId,
      }));

      await this.prisma.userLab.createMany({
        data: createManyData,
        skipDuplicates: true,
      });
    }


    const { password, ...userWithoutPassword } = newUser;

    const payload = {
      sub: newUser.id,
      username: newUser.username,
      email: newUser.email,
    };

    return {
      user: userWithoutPassword,
      access_token: this.jwtService.sign(payload),
    };
  }

  async getUserRoles(userId: number): Promise<string[]> {
    const roles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    return roles.map((r) => r.role.name);
  }

  async getUserLab(userId: number, labId: number) {
    return this.prisma.userLab.findUnique({
      where: {
        userId_labId: {
          userId,
          labId,
        },
      },
    });
  }

}
