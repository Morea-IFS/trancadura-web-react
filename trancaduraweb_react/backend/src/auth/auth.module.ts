import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule, // Adicionar o ConfigModule aos imports
    JwtModule.registerAsync({ // Usar registerAsync
      imports: [ConfigModule], // Importar para o contexto do JwtModule
      inject: [ConfigService], // Injetar o ConfigService
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Ler o segredo do .env
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'), // Ler o tempo de expiração
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}