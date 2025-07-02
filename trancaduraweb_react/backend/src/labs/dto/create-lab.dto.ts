import { IsString } from 'class-validator';

export class CreateLabDto {
  @IsString()
  name: string;
}
