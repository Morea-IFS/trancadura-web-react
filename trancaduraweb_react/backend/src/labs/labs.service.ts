import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';

@Injectable()
export class LabsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateLabDto) {
    return this.prisma.lab.create({ data });
  }

  findAll() {
    return this.prisma.lab.findMany();
  }

  findOne(id: number) {
    return this.prisma.lab.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateLabDto) {
    return this.prisma.lab.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.lab.delete({ where: { id } });
  }

  async linkDevice(labId: number, deviceId: number) {
    const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) throw new NotFoundException('Dispositivo não encontrado');

    return this.prisma.lab.update({
      where: { id: labId },
      data: { deviceId },
    });
  }

  async addUserToLab(userId: number, labId: number) {
    return this.prisma.userLab.create({
      data: { userId, labId },
    });
  }

  async unlock(userId: number, labId: number) {
    const lab = await this.prisma.lab.findUnique({
      where: { id: labId },
      include: { device: true, users: true },
    });

    if (!lab) throw new NotFoundException('Laboratório não encontrado');
    if (!lab.device) throw new NotFoundException('Dispositivo não vinculado ao laboratório');

    const userInLab = await this.prisma.userLab.findUnique({
      where: { userId_labId: { userId, labId } },
    });

    if (!userInLab) throw new NotFoundException('Usuário não faz parte deste laboratório');

    const device = lab.device;
    const access = await this.prisma.userAccess.create({
      data: {
        userId,
        deviceId: device.id,
        date: new Date(),
        permission: true,
      },
    });

    if (device.ipAddress) {
      try {
        await fetch(`http://${device.ipAddress}:3000/unlock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, accessId: access.id }),
        });
      } catch (e) {
        console.error('Erro ao comunicar com o ESP:', e);
      }
    }

    return {
      message: 'Acesso autorizado',
      access,
    };
  }
}
