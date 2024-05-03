/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from './../users/users.module';
import { RtStrategiest, AtStrategiest } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { EmailService } from 'src/Email/email.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UserRepository } from 'src/users/repository/user.repostory';

@Module({
  imports: [JwtModule.register({}), UsersModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, './uploads'); // Choisissez le chemin de destination approprié ici
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + '-' + file.originalname);
        },
      }),
    }),
  ],
  

  providers: [AuthService, AtStrategiest, RtStrategiest,EmailService,UserRepository],
  controllers: [AuthController],
})
export class AuthModule {}