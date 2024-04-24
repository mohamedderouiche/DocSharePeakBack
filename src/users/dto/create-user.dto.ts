/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  full_name: string;

  



  @IsOptional()
  @IsString()
  rereferred_by: string;
  
  qrCodeDataUrl:string;
  twoFactorSecret: string;
  

  image: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

 
  isVerify: boolean;

  hashdRt: string;

  createdAt: Date;
  updatedAt: Date;
}