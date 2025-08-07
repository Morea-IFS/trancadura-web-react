import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, ConflictException } from '@nestjs/common';
import { ApproximationsService } from './approximations.service';
import { CreateApproximationDto } from './dto/create-approximation.dto';
import { UpdateApproximationDto } from './dto/update-approximation.dto';
import { ApproximationAuthDto } from './dto/approximation-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterCardDto } from './dto/register-card.dto';

@Controller('approximations')
export class ApproximationsController {
  constructor(
    private readonly service: ApproximationsService, 
    private prisma: PrismaService
  ) {}

  @Post()
  create(@Body() data: CreateApproximationDto) {
    return this.service.create(data);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: UpdateApproximationDto) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }

  @Post('auth')
  async validate(@Body() dto: ApproximationAuthDto) {
    const result = await this.service.validateCard(dto);
    return result;
  }

  @Post('newcard')
  async registerNewCard(@Body() dto: RegisterCardDto) {
    // 1. Verifica se o cartão já existe com outro ID
    const existingCard = await this.prisma.approximation.findUnique({
      where: { cardId: dto.hexid }
    });

    if (existingCard) {
      throw new ConflictException('Este cartão já está cadastrado');
    }

    // 2. Cria o cartão (ou atualiza se estiver em modo de edição)
    const card = await this.prisma.approximation.upsert({
      where: { id: dto.deviceId }, // ou outro identificador
      create: {
        cardId: dto.hexid,
        permission: true,
        name: `Cartão ${dto.hexid.slice(0, 4)}...`
      },
      update: {
        cardId: dto.hexid,
        permission: true
      }
    });

    // 3. Vincula ao usuário
    await this.prisma.userCard.create({
      data: {
        userId: dto.userId,
        approximationId: card.id
      }
    });

    return { 
      success: true,
      cardId: card.id,
      userId: dto.userId
    };
  }
}
