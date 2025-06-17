// auth/dto/login-auth.dto.ts
import { IsString } from 'class-validator';

export class LoginAuthDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
