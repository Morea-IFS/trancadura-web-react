import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleCalendarService } from './google-calendar.service';

@Module({
  controllers: [ReservationsController],
  providers: [ReservationsService, PrismaService, GoogleCalendarService],
  exports: [ReservationsService],
})
export class ReservationsModule {}