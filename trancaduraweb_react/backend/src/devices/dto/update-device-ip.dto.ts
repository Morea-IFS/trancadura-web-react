// src/devices/dto/update-device-ip.dto.ts
import { IsString } from 'class-validator';

export class UpdateDeviceIpDto {
  @IsString()
  deviceId: string;

  @IsString()
  deviceIp: string;

  @IsString()
  apiToken: string;
}
