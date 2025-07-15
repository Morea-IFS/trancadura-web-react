import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async create(createDeviceDto: CreateDeviceDto) {
    return this.prisma.device.create({
      data: createDeviceDto,
    });
  }

  async findAll() {
    return this.prisma.device.findMany();
  }

  async findOne(id: number) {
    return this.prisma.device.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto) {
    return this.prisma.device.update({
      where: { id },
      data: updateDeviceDto,
    });
  }

  async remove(id: number) {
    return this.prisma.device.delete({
      where: { id },
    });
  }

  async identifyDevice(macAddress: string) {
      const device = await this.prisma.device.findUnique({
        where: { macAddress },
      });
  
      const newApiToken = randomUUID();
  
      if (device) {
        await this.prisma.device.update({
          where: { macAddress },
          data: { apiToken: newApiToken },
        });
  
        return {
          id: device.uuid,
          api_token: newApiToken,
        };
      }
  
      const newUuid = randomUUID();
  
      const created = await this.prisma.device.create({
        data: {
          uuid: newUuid,
          macAddress,
          apiToken: newApiToken,
        },
      });
  
      return {
        id: newUuid,
        api_token: newApiToken,
      };
    }

}
