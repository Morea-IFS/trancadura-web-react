import { Module } from '@nestjs/common';
import { ButtonsController } from './buttons.controller';
import { ButtonsService } from './buttons.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ButtonsController],
  providers: [ButtonsService, PrismaService],
})
export class ButtonsModule {}
