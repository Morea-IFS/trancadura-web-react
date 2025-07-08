import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApproximationsService } from './approximations.service';
import { CreateApproximationDto } from './dto/create-approximation.dto';
import { UpdateApproximationDto } from './dto/update-approximation.dto';
import { ApproximationAuthDto } from './dto/approximation-auth.dto';

@Controller('approximations')
export class ApproximationsController {
  constructor(private readonly service: ApproximationsService) {}

  @Post()
  create(@Body() data: CreateApproximationDto) {
    return this.service.create(data);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: UpdateApproximationDto) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }

  @Post('auth')
  async validate(@Body() dto: ApproximationAuthDto) {
    const result = await this.service.validateCard(dto);
    return result;
  }
}
