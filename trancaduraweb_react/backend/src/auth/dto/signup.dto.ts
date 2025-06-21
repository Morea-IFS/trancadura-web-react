import { IsEmail, IsNotEmpty, MinLength, IsIn } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsIn(['admin', 'basic']) // permite somente 'admin' ou 'basic'
  role: string;
}
