import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class SignupLabDto {
  @IsNotEmpty()
  @Type(() => Number)
  labId: number;

  @IsOptional()
  isStaff: boolean;
}

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SignupLabDto)
  labs?: SignupLabDto[];
}
