import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  isStaff?: boolean;
}
