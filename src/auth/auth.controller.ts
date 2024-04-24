/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

import { Tokens } from './../types';
import { RtGuard } from './../common/guards';
import {
  GetCurrentUserId,
  GetCurrentUser,
  Public,
} from './../common/decorators';
import { AuthDto } from './dto/auth.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private readonly userService: UsersService,private jwtService: JwtService) {}

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AuthDto, @Body("token") tokenn: string, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.login(dto,tokenn);
    res.cookie('access_cookies', token.access_token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      path: '/',
      sameSite: 'none',
      secure: true,
    });
  
    return token;
  }



 
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image')) // Interceptor for handling file upload
  async register(@Body() dto: AuthDto, @UploadedFile() image: Express.Multer.File): Promise<string> {
    return await this.authService.register(dto, image);
  }




  // @Post('/logout')
  // @HttpCode(HttpStatus.OK)
  // async logout(@GetCurrentUserId() userId: string) {
  //   return await this.authService.logout(userId);
  // }

  @Public()
  @UseGuards(RtGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrentUser('refreshToken') refreshToken: string,
    @GetCurrentUserId() userId: string,
  ) {
    return await this.authService.refreshTokens(userId, refreshToken);
  }

  @Get('profile')
  async profile(@GetCurrentUserId() userId: string) {
    return await this.authService.getProfile(userId);
  }


  // @UseGuards(JwtAuthGuard)
  // @Put('update-password')
  // async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
  //   return this.userService.updatePassword( updatePasswordDto);
  // }



  @Get('activate/:token')
  async activateAccount(@Param('token') token: string,@Res() res): Promise<any> {
    const secretKey = 'qsdsqdqdssqds'; // Update this with your secret key

    try {
      const decoded: any = this.jwtService.verify(token, { secret: secretKey });
      // Assuming 'decoded.email' is the email associated with the user
      const userEmail = decoded.email;
      // Update the user in the database to set 'isVerify' to true
      const updatedUser = await this.userService.findOneAndUpdate(
        { email: userEmail },
        { isVerify: true },
        { new: true },
      );
      if (!updatedUser) {
        throw new NotFoundException('Utilisateur non trouvé');
      }
      res.status(HttpStatus.OK).json({ message: 'Compte activé avec succès' });
    } catch (error) {
      console.error(error);
      if (
        error.name === 'TokenExpiredError' ||
        error.name === 'JsonWebTokenError'
      ) {
        throw new UnauthorizedException('Token invalide ou expiré');
      }
      throw new InternalServerErrorException(
        "Erreur lors de l'activation du compte",
      );
    }
  }

  // *************************************


  @Post('update-password/:email')
  async updatePassword(@Param('email') email: string, @Body('newPassword') newPassword: string, @Body('oldPassword') oldPassword: string,@Res() res: any) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await this.userService.updatePasswordOldNew(email, hashedPassword,oldPassword);
      if (!updatedUser) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'Utilisateur non trouvé' });
      }

      console.log('Password reset successful for user:', email);
      return res.status(HttpStatus.OK).json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
    }
  }

  @Post('forget-password')
  async forgetPassword(@Body('email') email: string) {
    try {
      await this.authService.forgetPassword(email);
      return { message: 'Email has been sent!' };
    } catch (error) {
      console.error(error);
      throw new Error('Error occurred while sending email.');
    }
  }


  @Post('receive-token/:token')
  async receiveToken(@Param('token') token: string, @Body('newPassword') newPassword: string, @Res() res: any) {
    try {
      const secretKey = 'qsdsqdqdssqds';
      const decoded: any = this.jwtService.verify(token, { secret: secretKey });
      
      const userEmail = decoded.email;
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await this.userService.updatePassword(userEmail, hashedPassword);
      
      if (!updatedUser) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'Utilisateur non trouvé' });
      }

      console.log('Password reset successful for user:', userEmail);
      return res.status(HttpStatus.OK).json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
    }
  }
// ******************************

@Post('check-password')
async checkPassword(@Body() body: { plainPassword: string, hashedPassword: string }) {
  try {
    const { plainPassword, hashedPassword } = body;
    const passwordMatches = await this.authService.comparePasswords(plainPassword, hashedPassword);
    console.log(passwordMatches);
    return { passwordMatches };
  } catch (error) {
    console.error(error.message);
    throw new BadRequestException('Erreur lors de la comparaison des mots de passe');
  }
}
}