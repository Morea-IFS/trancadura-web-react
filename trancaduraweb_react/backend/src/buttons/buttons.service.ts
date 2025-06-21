import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { CreateButtonDto } from './dto/create-button.dto';
import { UpdateButtonDto } from './dto/update-button.dto';

@Injectable()
export class ButtonsService {
  constructor(private prisma: PrismaService) {}

  async create(createButtonDto: CreateButtonDto) {
    return this.prisma.button.create({
      data: createButtonDto,
    });
  }

  async findAll() {
    return this.prisma.button.findMany();
  }

  async findOne(id: string) {
    return this.prisma.button.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateButtonDto: UpdateButtonDto) {
    return this.prisma.button.update({
      where: { id },
      data: updateButtonDto,
    });
  }

  async remove(id: string) {
    return this.prisma.button.delete({
      where: { id },
    });
  }

  async linkButtonToDevice(buttonId: string, deviceId: string) {
    return this.prisma.buttonDevice.create({
      data: {
        buttonId,
        deviceId,
      },
    });
  }


  async registerUnlock(userId: number) {
    const buttonDevice = await this.prisma.buttonDevice.findFirst({
      include: {
        device: true,
      },
    });

    if (!buttonDevice) throw new Error('Botão ou dispositivo não vinculado');

    const deviceId = buttonDevice.deviceId;
    const deviceIp = buttonDevice.device.ipAddress;

    const isAuthorized = await this.prisma.deviceRole.findFirst({
      where: {
        deviceId,
        role: {
          userRoles: {
            some: {
              userId,
            },
          },
        },
      },
    });

    const access = await this.prisma.userAccess.create({
      data: {
        userId,
        deviceId,
        date: new Date(),
        permission: !!isAuthorized,
      },
    });

    // ⚡ Se autorizado, envia requisição para o ESP
    if (isAuthorized && deviceIp) {
      try {
        await axios.post(`http://${deviceIp}/unlock`, {
          userId,
          accessId: access.id,
        });
      } catch (err) {
        console.error('Erro ao comunicar com o ESP:', err.message);
      }
    }

    return {
      message: !!isAuthorized ? 'Acesso autorizado e enviado ao ESP' : 'Acesso negado',
      access,
    };
  }


}
