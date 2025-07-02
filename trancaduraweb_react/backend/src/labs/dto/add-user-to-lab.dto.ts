// src/labs/dto/add-users-to-lab.dto.ts
import { IsInt, IsArray, ArrayNotEmpty } from 'class-validator';

export class AddUsersToLabDto {
  @IsInt()
  labId: number;

  @IsArray()
  @ArrayNotEmpty()
  userIds: number[];
}
