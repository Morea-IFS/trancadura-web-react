import { IsInt } from 'class-validator';

export class LinkDeviceDto {
  @IsInt()
  labId: number;

  @IsInt()
  deviceId: number;
}
