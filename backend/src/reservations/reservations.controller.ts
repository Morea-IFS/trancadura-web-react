import { Controller, Get, Post, Body, Param, Delete, UseGuards, ParseIntPipe, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @Roles('superuser', 'staff')
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  @Roles('superuser', 'staff')
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get('my')
  findMyReservations(@Req() req) {
    return this.reservationsService.findByUser(req.user.userId);
  }

  @Delete(':id')
  @Roles('superuser', 'staff')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.remove(id);
  }

  @Post('import-schedule')
  @UseInterceptors(FileInterceptor('file'))
  async importSchedule(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    // Chama o serviço para processar o PDF
    return this.reservationsService.processSchedulePdf(file);
  }

  @Get('sync-google')
  async syncGoogle() {
    return this.reservationsService.syncGoogleCalendar();
  }

  @Post('batch')
  async createBatch(@Body() reservations: CreateReservationDto[]) {
    if (!Array.isArray(reservations) || reservations.length === 0) {
      throw new BadRequestException('Envie uma lista de reservas válida.');
    }
    return this.reservationsService.createBatch(reservations);
  }
}