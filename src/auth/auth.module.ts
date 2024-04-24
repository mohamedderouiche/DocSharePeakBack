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

@Module({
  imports: [JwtModule.register({}), UsersModule,
    MulterModule.register({
      // dest: './uploads',
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Générez un nom de fichier unique pour chaque fichier téléchargé
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          //cb(null, uniqueSuffix + '-' + file.originalname);
          cb(null,  "src/public/assets");

        },filename: (req, file, cb) => {
          // Générez un nom de fichier unique pour chaque fichier téléchargé
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          //cb(null, uniqueSuffix + '-' + file.originalname);
          cb(null,  file.originalname);

        },
      }),
    })
  ],
  

  providers: [AuthService, AtStrategiest, RtStrategiest,EmailService],
  controllers: [AuthController],
})
export class AuthModule {}