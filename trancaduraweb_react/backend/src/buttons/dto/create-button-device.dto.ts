import { IsString } from 'class-validator';

export class CreateButtonDeviceDto {
  @IsString()
  buttonId: string;

  @IsString()
  deviceId: string;
}
