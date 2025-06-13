import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DevicesModule } from './devices/devices.module';
import { RolesModule } from './roles/roles.module';
import { ApproximationsModule } from './approximations/approximations.module';
import { ButtonsModule } from './buttons/buttons.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [AuthModule, UsersModule, DevicesModule, RolesModule, ApproximationsModule, ButtonsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
