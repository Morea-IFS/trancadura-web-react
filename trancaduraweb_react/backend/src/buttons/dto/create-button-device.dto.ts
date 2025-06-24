import { IsNumber } from 'class-validator';

export class CreateButtonDeviceDto {
  @IsNumber()
  buttonId: number;

  @IsNumber()
  deviceId: number;
}
