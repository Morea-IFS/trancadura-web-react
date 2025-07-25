import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { LinkCardDto } from './dto/link-card.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    const userId = req.user.userId;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      userId: user.id, // <- necessário para o frontend funcionar
      username: user.username,
      email: user.email,
      roles: user.roles, // [{ role: { name: 'superuser' } }]
    };
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('me')
  // getMe(
  //   @Req()
  //   req: {
  //     user: { id: number; name: string; email: string };
  //   },
  // ) {
  //   return req.user;
  // }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Post('link-card')
  @UseGuards(JwtAuthGuard)
  linkCard(@Body() dto: LinkCardDto) {
    return this.usersService.linkCardToUser(dto.userId, dto.approximationId);
  }

  @Get(':id/cards')
  getUserCards(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserCards(id);
  }

}
