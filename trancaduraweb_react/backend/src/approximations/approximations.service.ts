import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApproximationDto } from './dto/create-approximation.dto';
import { UpdateApproximationDto } from './dto/update-approximation.dto';
import { ApproximationAuthDto } from './dto/approximation-auth.dto';

@Injectable()
export class ApproximationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateApproximationDto) {
    return await this.prisma.approximation.create({
      data,
    });
  }

  async findAll() {
    return await this.prisma.approximation.findMany();
  }

  async findOne(id: number) {
    const approximation = await this.prisma.approximation.findUnique({
      where: { id },
    });
    if (!approximation) throw new NotFoundException(`Approximation ${id} not found`);
    return approximation;
  }

  async update(id: number, data: UpdateApproximationDto) {
    await this.findOne(id);
    return await this.prisma.approximation.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prisma.approximation.delete({
      where: { id },
    });
  }

  async validateCard(dto: ApproximationAuthDto) {
    const { hexid, macaddress } = dto;

    // Verifica se o cartão existe
    let card = await this.prisma.approximation.findUnique({
      where: { cardId: hexid },
    });

    // Se não existir, cria um novo cartão com permission: false
    if (!card) {
      card = await this.prisma.approximation.create({
        data: {
          cardId: hexid,
          permission: false,
        },
      });
      return {
        message: 'Card criado, mas ainda não autorizado.',
        status: 404,
      };
    }

    // Se o cartão não tem permissão
    if (!card.permission) {
      return {
        message: 'Cartão encontrado, mas sem permissão.',
        status: 403,
      };
    }

    // Verifica se o dispositivo existe
    const device = await this.prisma.device.findUnique({
      where: { macAddress: macaddress },
    });

    if (!device) {
      return {
        message: 'Dispositivo não encontrado.',
        status: 404,
      };
    }

    // Busca a role do dispositivo
    const deviceRole = await this.prisma.deviceRole.findFirst({
      where: { deviceId: device.id },
    });

    if (!deviceRole) {
      return {
        message: 'Dispositivo não possui role associada.',
        status: 403,
      };
    }

    // Busca o usuário vinculado ao cartão
    const userCard = await this.prisma.userCard.findFirst({
      where: { approximationId: card.id },
    });

    if (!userCard) {
      return {
        message: 'Cartão sem usuário associado.',
        status: 403,
      };
    }

    // Busca a role do usuário
    const userRole = await this.prisma.userRole.findFirst({
      where: { userId: userCard.userId },
    });

    if (!userRole) {
      return {
        message: 'Usuário não possui role associada.',
        status: 403,
      };
    }

    // Compara roles
    const isAuthorized = userRole.roleId === deviceRole.roleId;

    // Salva tentativa de acesso
    await this.prisma.userAccess.create({
      data: {
        userId: userCard.userId,
        deviceId: device.id,
        permission: isAuthorized,
      },
    });

    return {
      message: isAuthorized ? 'Acesso autorizado.' : 'Acesso não autorizado.',
      authorized: isAuthorized,
      status: isAuthorized ? 200 : 403,
    };
  }

}
