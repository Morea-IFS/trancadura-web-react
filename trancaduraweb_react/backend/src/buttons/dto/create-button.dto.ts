import { IsString, IsOptional } from 'class-validator';

export class CreateButtonDto {
  @IsString()
  uuid: string;

  @IsOptional()
  @IsString()
  macAddress?: string;

  @IsOptional()
  @IsString()
  apiToken?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
