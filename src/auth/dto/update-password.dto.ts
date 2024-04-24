/* eslint-disable prettier/prettier */
// update-password.dto.ts
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {

    @IsString()
    //   @MinLength(6)
      readonly id: string;
  @IsString()
//   @MinLength(6)
  readonly oldPassword: string;

  @IsString()
//   @MinLength(6)
  readonly newPassword: string;
}
