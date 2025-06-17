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
}
