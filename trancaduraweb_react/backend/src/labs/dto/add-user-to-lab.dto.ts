import { IsInt } from 'class-validator';

export class AddUserToLabDto {
  @IsInt()
  userId: number;

  @IsInt()
  labId: number;
}
