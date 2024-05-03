/* eslint-disable prettier/prettier */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  HttpStatus,
  Res,
  Get,
  Param,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './../users/users.service';
import { Tokens } from './../types';
import { AuthDto } from './dto/auth.dto';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import { unlinkSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as multer from 'multer';
// import { Multer } from 'multer';
import { Stream } from 'stream';
import * as BufferList from 'bl';
import { Model } from 'mongoose';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { EmailService } from 'src/Email/email.service';
import { User } from 'src/users/schemas/user.schema';
import { UserRepository } from 'src/users/repository/user.repostory';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  // Login

async login(dto: AuthDto, token: string): Promise<Tokens> {
  const user: any = await this.userService.findUserByEmail(dto.email);

  if (!user) throw new ForbiddenException('Access Denied.');

  if (!user.isVerify) throw new ForbiddenException('Account not verified.');

  const passwordMatches = await bcrypt.compare(dto.password, user.password);

  if (!passwordMatches) throw new ForbiddenException('Access Denied.');

  // Vérifiez si l'authentification à deux facteurs est activée pour l'utilisateur
  if (user.twoFactorSecret) {
      // Vérifiez le token fourni par l'utilisateur avec le secret pour l'authentification à deux facteurs
      const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: token,
          window: 1
      });
      if (!verified) throw new UnauthorizedException('Invalid token.');
  }

  const tokens = await this.getTokens(user);

  const rtHash = await this.hashPassword(tokens.refresh_token);

  await this.userService.updateOne(user._id, { hashdRt: rtHash });

  return tokens;
}


  // Logout
  async logout(userId: string) {
    await this.userService.updateOne(userId, { hashdRt: null });
  }

  // Refresh tokens
  async refreshTokens(userId: string, rt: string) {
    const user = await this.userService.findById(userId);

    if (!user || !user.hashdRt) {
      throw new ForbiddenException('Access Denied.');
    }

    const rtMatches = await bcrypt.compare(rt, user.hashdRt);

    if (!rtMatches) {
      throw new ForbiddenException('Access Denied.');
    }

    const tokens = await this.getTokens(user);
    const rtHash = await this.hashPassword(tokens.refresh_token);
    await this.userService.updateOne(user._id, { hashdRt: rtHash });

    return tokens;
  }

  

  async sendMailtoStudent(email: string, fullname: string): Promise<void> {
    const secretKey = 'qsdsqdqdssqds';
    const token = this.jwtService.sign(
      { email },
      { secret: secretKey, expiresIn: '1d' },
    );

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'contact.fithealth23@gmail.com',
        pass: 'ebrh bilu ygsn zrkw',
      },
    });

    const msg = {
      from: {
        name: 'Active your account',
        address: 'contact.fithealth23@gmail.com',
      },
      to: email,
      subject: ' Account Confirmation',
      // html: `<b><b>HI ${fullname} ? <a href="http://localhost:3046/auth/activate/${token}">Activate Your Account</a></b>`,
      html: `<b><b>HI ${fullname} ? <a href="http://localhost:3000/authentication/activation/${token}">Activate Your Account</a></b>`
    };
    
    try {
      await transporter.sendMail(msg);
      console.log('Email has been sent!');
    } catch (error) {
      console.error(error);
    }
  }

  // *****************register with image *********************

  async register(dto: AuthDto, image: Express.Multer.File): Promise<string> {
    const existingUser = await this.userService.findUserByEmail(dto.email);
    if (existingUser) {
      throw new ForbiddenException('Email address is already registered.');
    }

    const secret = speakeasy.generateSecret({ length: 20 });
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: 'MyApp',
      issuer: 'MyApp'
    });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl).catch((error) => {
      console.error('Error generating QR code:', error);
      throw new InternalServerErrorException('Failed to generate QR code.');
    });

    if (image) {
      console.log('Image uploaded:', image.filename);
    }
    let imageUrl: string | undefined;
    if (image) {
      imageUrl = image.path; // Utilisez le champ 'path' pour obtenir le chemin de l'image
      console.log('Image uploaded:', imageUrl);
    }

    const user: any = await this.userService.create({
      email: dto.email,
      password: dto.password,
      full_name: dto.full_name,
      isVerify: dto.isVerify,
      twoFactorSecret: secret.base32,
      qrCodeDataUrl: qrCodeDataUrl,
      image:imageUrl
    });

    const tokens = await this.getTokens(user);
    const rtHash = await this.hashPassword(tokens.refresh_token);
    await this.userService.updateOne(user._id, { hashdRt: rtHash });

    await this.sendMailtoStudent(dto.email, dto.full_name);
  await this.sendQRCodeToUser(dto.email,qrCodeDataUrl);

    return qrCodeDataUrl;
  }
  // **********************************************************
  async updateProfileImage(userId: string, image: Express.Multer.File): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let imageUrl: string | undefined;
    if (image) {
      if (user.image) {
        unlinkSync(user.image);
      }
      imageUrl = image.path;
      await this.updateOne(userId, { image: imageUrl });
    }

    return await this.userRepository.findById(userId);
  }

  async updateOne(userId: string, data: any) {
    await this.userRepository.updateOne( userId ,data );
  }
 
//  **********************************************************
  
  async sendQRCodeToUser(email: string, qrCodeDataUrl: string): Promise<void> {
    // Configurer le service de messagerie (vous pouvez utiliser Nodemailer ou tout autre service de messagerie de votre choix)
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'contact.fithealth23@gmail.com',
        pass: 'ebrh bilu ygsn zrkw',
      },
    });
  
    // Définir le contenu du message
    const msg = {
      from: {
        name: 'MyApp',
        address: 'contact.fithealth23@gmail.com',
      },
      to: email,
      subject: 'QR Code for Two-Factor Authentication',
      html: `
      <p>Dear User,</p>
      <p>Please scan the following QR code with your authenticator app to enable Two-Factor Authentication:</p>
      <img src="cid:qrCodeImage" alt="QR Code"/>
      `,
      attachments: [{
        filename: 'qr-code.png',
        path: qrCodeDataUrl,
        cid: 'qrCodeImage'
      }]
    };
  
    // Envoyer l'e-mail
    await transporter.sendMail(msg).catch((error) => {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('Failed to send email.');
    });
  
    console.log('Email with QR code has been sent to the user.');
  }
  
  
  // **********************************************************************

 

  async getProfile(id: string) {
    const user = await this.userService.findById(id);

    if (user) {
      user.password = null;
      user.hashdRt = null;
    }

    return user;
  }

  // Generate access and refresh tokens
  async getTokens(user: any): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user._id,
          email: user.email,
          ROLE: user.role,
          username:user.full_name,
          password:user.password,
          qrCodeDataUrl: user.qrCodeDataUrl,
          image: user.image,
        },
        {
          secret: process.env.ACCESS_TOKEN_SECRET || 'at-secret',
          expiresIn: '24h',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user._id,
          email: user.email,
          username:user.full_name,
          qrCodeDataUrl: user.qrCodeDataUrl,
          password:user.password,
          image: user.image,
        },
        {
          secret: process.env.REFRESH_TOKEN_SECRET || 'rt-secret',
          expiresIn: '30d',
        },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  // Encrypt password
  async hashPassword(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }


  // ***************************

  async validateUserPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return bcrypt.compare(password, user.password);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Hasher le nouveau mot de passe
    await this.userService.updatePassword(userId, hashedPassword);
  }

  async forgetPassword(email: string): Promise<void> {
    console.log("Received request to reset password:", email);
    const secretKey = process.env.EMAIL_SECRET_KEY || 'qsdsqdqdssqds';
    const token = this.jwtService.sign({ email }, { secret: secretKey, expiresIn: '24h' });

    
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'contact.fithealth23@gmail.com',
        pass: 'ebrh bilu ygsn zrkw',
      },
    });

    const msg = {
      from: {
        name: 'Activate Your Account',
        address: 'contact.fithealth23@gmail.com',
      },
      to: email,
      subject: 'Reset Password',
     /* html: `<b>Hello World, <a href="http://localhost:3000/authentication/receive-token/${token}">Reset password</a></b>`,
    */
     html: this.emailService.exportMail("You Have been Added To ","http://localhost:3000/authentication/receive-token/"+token),
    };

    const sendMail = async (transporter: any, msg: any) => {
      try {
        await transporter.sendMail(msg);
        // res.send("Email has been sent !");
        console.log("Email has been sent !");
      } catch (error) {
        console.error(error);
      }
    };
    sendMail(transporter, msg);
  }

  

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      const passwordMatches = await bcrypt.compare(plainPassword, hashedPassword);
      return passwordMatches;
    } catch (error) {
      console.error(error);
      throw new Error('Erreur lors de la comparaison des mots de passe');
    }
  }

 
}
  
 