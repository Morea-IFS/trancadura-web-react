import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    return this.prisma.role.create({
      data: createRoleDto,
    });
  }

  async findAll() {
    return this.prisma.role.findMany();
  }

  async findOne(id: number) {
    return this.prisma.role.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    return this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  async remove(id: number) {
    return this.prisma.role.delete({
      where: { id },
    });
  }

  async removeRoleFromUser(dto: { userId: number, roleId: number }) {
    try {
      return await this.prisma.userRole.delete({
        where: {
          userId_roleId: {
            userId: dto.userId,
            roleId: dto.roleId
          }
        }
      });
    } catch (error) {
      console.error("Erro ao remover role do usuário:", error);
      throw new NotFoundException("Relação usuário-role não encontrada");
    }
  }

  // src/roles/roles.service.ts
  async assignRoleToUser(dto: AssignRoleDto) {
    const { userId, roleId } = dto;

    // Confirma se o usuário existe
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    // Confirma se o papel existe
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Papel (role) não encontrado');

    // Cria ou ignora se já existir
    return this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
      update: {},
      create: {
        userId,
        roleId,
      },
    });
  }

}
