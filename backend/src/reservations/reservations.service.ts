import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
    constructor(private prisma: PrismaService) {}

    async create(createReservationDto: CreateReservationDto) {
        return this.prisma.reservation.create({
            data: {
                ...createReservationDto,
            },
        });
    }

    async findAll() {
        return this.prisma.reservation.findMany();
    }
    
    async findOne(id: number) {
        return this.prisma.reservation.findUnique({
            where: { id },
        });
    }

    async update(id: number, updateReservationDto: UpdateReservationDto) {
        return this.prisma.reservation.update({
            where: { id },
            data: {
                ...updateReservationDto,
            },
        });
    }
    
    async remove(id: number) {
        return this.prisma.reservation.delete({
            where: { id },
        });
    }
}