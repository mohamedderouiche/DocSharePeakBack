/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: "mongodb+srv://ferjaniwael20:7xWxxPKsiBxYdxAT@cluster0.qrfp2yq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
      }),
    }),
  ],
})
export class DataBaseModule {}
