import { IsString, IsOptional } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  uuid: string;

  @IsOptional()
  @IsString()
  macAddress?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  apiToken?: string;
}
