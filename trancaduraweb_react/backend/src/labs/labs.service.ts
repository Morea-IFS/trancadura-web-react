import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';
import { AddUsersToLabDto } from './dto/add-user-to-lab.dto';

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
    return this.prisma.lab.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  update(id: number, data: UpdateLabDto) {
    return this.prisma.lab.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.lab.delete({ where: { id } });
  }

  async addUsersToLab(dto: AddUsersToLabDto) {
    const data = dto.users.map((user) => ({
      userId: user.userId,
      labId: dto.labId,
      isStaff: user.isStaff,
    }));

    return this.prisma.userLab.createMany({
      data,
      skipDuplicates: true,
    });
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

  async unlock(userId: number, labId: number) {
    const lab = await this.prisma.lab.findUnique({
      where: { id: labId },
      include: { device: true },
    });

    if (!lab) {
      throw new NotFoundException('Laboratório não encontrado');
    }
    if (!lab.device) {
      throw new NotFoundException(
        'Nenhum dispositivo de acesso está vinculado a este laboratório',
      );
    }
    

    // Verifica se o usuário tem permissão para acessar o laboratório
    const userInLab = await this.prisma.userLab.findUnique({
      where: { userId_labId: { userId, labId } },
    });

    if (!userInLab) {
      throw new NotFoundException(
        'Usuário não tem permissão para acessar este laboratório',
      );
    }

    const device = lab.device;

    // Registra a tentativa de acesso no banco de dados
    const access = await this.prisma.userAccess.create({
      data: {
        userId,
        deviceId: device.id,
        date: new Date(),
        permission: true,
      },
    });

    // Envia o comando de abertura para o dispositivo (ESP32)
    try {
      // Monta a URL esperada pelo ESP32
      const espUrl = `http://${device.ipAddress}/open?apiToken=${device.apiToken}`;
      
      console.log(`Enviando comando de abertura para: ${espUrl}`);

      // Realiza a requisição GET, sem corpo (body)
      await fetch(espUrl);

      console.log(`Comando de destravamento para o lab ${labId} enviado com sucesso.`);

    } catch (error) {
      console.error(
        `Falha ao comunicar com o dispositivo ${device.ipAddress}:`,
        error,
      );
      // throw new Error('Não foi possível comunicar com o dispositivo de acesso.');
    }

    return {
      message: 'Comando de acesso enviado ao dispositivo.',
      access,
    };
  }

  async removeUsersFromLab(dto: { labIds: number[], userId: number }) {
    return this.prisma.userLab.deleteMany({
      where: {
        userId: dto.userId,
        labId: { in: dto.labIds }
      }
    });
  }

  async getLabsByUser(userId: number) {
    return this.prisma.lab.findMany({
      where: {
        users: {
          some: { userId },
        },
      },
      include: {
        users: true,
      },
    });
  }
}
