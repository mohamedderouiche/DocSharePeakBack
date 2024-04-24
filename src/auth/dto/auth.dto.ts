/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class AuthDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  image: string;

  isVerify: boolean;

   @IsOptional()
  full_name: string;

  @IsOptional()
  qrCodeDataUrl:string;

  @IsOptional()
  twoFactorSecret: string;
}