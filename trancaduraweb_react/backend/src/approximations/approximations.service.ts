import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApproximationDto } from './dto/create-approximation.dto';
import { UpdateApproximationDto } from './dto/update-approximation.dto';
import { ApproximationAuthDto } from './dto/approximation-auth.dto';
import { randomUUID } from 'crypto';

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

    // 1. Verifica se o cartão existe
    let card = await this.prisma.approximation.findUnique({
      where: { cardId: hexid },
    });

    if (!card) {
      await this.prisma.approximation.create({
        data: {
          cardId: hexid,
          permission: false,
        },
      });
      return "Unauthorized";
    }

    // 2. Verifica permissão do cartão
    if (!card.permission) {
      return "Unauthorized";
    }

    // 3. Verifica o dispositivo
    const device = await this.prisma.device.findUnique({
      where: { macAddress: macaddress },
    });

    if (!device) return "Unauthorized";

    // 4. Verifica role do dispositivo
    const deviceRole = await this.prisma.deviceRole.findFirst({
      where: { deviceId: device.id },
    });
    if (!deviceRole) return "Unauthorized";

    // 5. Verifica o usuário vinculado ao cartão
    const userCard = await this.prisma.userCard.findFirst({
      where: { approximationId: card.id },
    });
    if (!userCard) return "Unauthorized";

    const userRole = await this.prisma.userRole.findFirst({
      where: { userId: userCard.userId },
    });
    if (!userRole) return "Unauthorized";

    // 6. Compara roles
    const isAuthorized = userRole.roleId === deviceRole.roleId;

    // 7. Registra tentativa de acesso
    await this.prisma.userAccess.create({
      data: {
        userId: userCard.userId,
        deviceId: device.id,
        permission: isAuthorized,
      },
    });

    return isAuthorized ? "Authorized" : "Unauthorized";
  }


}
