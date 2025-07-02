import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { LabsService } from './labs.service';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';
import { LinkDeviceDto } from './dto/link-device.dto';
import { AddUserToLabDto } from './dto/add-user-to-lab.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('labs')
export class LabsController {
  constructor(private readonly labsService: LabsService) {}

  @Post()
  create(@Body() dto: CreateLabDto) {
    return this.labsService.create(dto);
  }

  @Get()
  findAll() {
    return this.labsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.labsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateLabDto) {
    return this.labsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.labsService.remove(id);
  }

  @Post('link-device')
  linkDevice(@Body() dto: LinkDeviceDto) {
    return this.labsService.linkDevice(dto.labId, dto.deviceId);
  }

  @Post('add-user')
  addUserToLab(@Body() dto: AddUserToLabDto) {
    return this.labsService.addUserToLab(dto.userId, dto.labId);
  }

  @Post('unlock/:labId')
  @UseGuards(JwtAuthGuard)
  unlock(@Param('labId') labId: number, @Req() req) {
    const userId = +req.user.userId;
    return this.labsService.unlock(userId, labId);
  }
}
