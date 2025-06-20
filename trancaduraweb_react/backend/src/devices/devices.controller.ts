import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService, private prisma: PrismaService) {}

  @Post()
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesService.remove(id);
  }

  @Get(':id/latest')
  @UseGuards(JwtAuthGuard)
  async getLatestAccess(@Param('id') deviceId: string) {
    const latest = await this.prisma.userAccess.findFirst({
      where: { deviceId },
      orderBy: { date: 'desc' },
    });

    return {
      success: true,
      access: latest,
      message: latest ? 'Último acesso encontrado' : 'Nenhum acesso registrado para este dispositivo',
    };
  }
}
