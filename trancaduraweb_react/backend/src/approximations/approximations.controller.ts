import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApproximationsService } from './approximations.service';
import { CreateApproximationDto } from './dto/create-approximation.dto';
import { UpdateApproximationDto } from './dto/update-approximation.dto';

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
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateApproximationDto) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
