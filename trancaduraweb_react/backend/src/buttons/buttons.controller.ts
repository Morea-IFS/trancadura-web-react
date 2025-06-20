import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { ButtonsService } from './buttons.service';
import { CreateButtonDto } from './dto/create-button.dto';
import { UpdateButtonDto } from './dto/update-button.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { CreateButtonDeviceDto } from './dto/create-button-device.dto';

@Controller('buttons')
export class ButtonsController {
  constructor(private readonly buttonsService: ButtonsService) {}

  @Post()
  create(@Body() createButtonDto: CreateButtonDto) {
    return this.buttonsService.create(createButtonDto);
  }

  @Get()
  findAll() {
    return this.buttonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.buttonsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateButtonDto: UpdateButtonDto) {
    return this.buttonsService.update(id, updateButtonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.buttonsService.remove(id);
  }

  @Post('link-device')
  async linkDevice(@Body() dto: CreateButtonDeviceDto) {
    return this.buttonsService.linkButtonToDevice(dto.buttonId, dto.deviceId);
  }

  @Post('unlock')
  @UseGuards(JwtAuthGuard)
  async unlock(@Req() req) {
    const userId = +req.user.userId;
    return this.buttonsService.registerUnlock(userId);
  }
}
