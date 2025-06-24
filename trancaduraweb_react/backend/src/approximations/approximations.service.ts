import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApproximationDto } from './dto/create-approximation.dto';
import { UpdateApproximationDto } from './dto/update-approximation.dto';

@Injectable()
export class ApproximationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateApproximationDto) {
    return await this.prisma.approximation.create({
      data,
    });
  }

  async findAll() {
    return await this.prisma.approximation.findMany();
  }

  async findOne(id: string) {
    const approximation = await this.prisma.approximation.findUnique({
      where: { id },
    });
    if (!approximation) throw new NotFoundException(`Approximation ${id} not found`);
    return approximation;
  }

  async update(id: string, data: UpdateApproximationDto) {
    await this.findOne(id);
    return await this.prisma.approximation.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.approximation.delete({
      where: { id },
    });
  }
}
