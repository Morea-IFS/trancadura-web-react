import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
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
  findOne(@Param('id') id: number) {
    return this.devicesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.devicesService.remove(id);
  }

  @Get(':id/all')
  @UseGuards(JwtAuthGuard)
  async getAllAccess(@Param('id', ParseIntPipe) deviceId: number) {
    const accesses = await this.prisma.userAccess.findMany({
      where: {
        deviceId: deviceId,
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        user: true,
      },
    });

    return accesses;
    }
}