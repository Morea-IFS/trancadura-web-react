import { Injectable } from '@nestjs/common';
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
    // Busca o primeiro botão -> device vinculado
    const buttonDevice = await this.prisma.buttonDevice.findFirst({
      include: {
        device: true,
      },
    });

    if (!userId || isNaN(userId)) {
      throw new Error('ID de usuário inválido');
    }

    if (!buttonDevice) throw new Error('Botão ou dispositivo não vinculado');

    const newAccess = await this.prisma.userAccess.create({
      data: {
        userId,
        deviceId: buttonDevice.deviceId,
        date: new Date(),
      },
    });

    return {
      message: 'Acesso registrado',
      access: newAccess,
    };
  }

}
