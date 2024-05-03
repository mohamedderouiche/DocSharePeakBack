/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileImport, FileSchema } from './file.schemas';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { Document, DocumentSchema } from 'src/Document/Schemas/Document.schemas';


@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: FileImport.name,
        schema: FileSchema,
      },
    ]),
    MongooseModule.forFeature([{ name: Document.name, schema: DocumentSchema }]), 


  ],
  providers: [FilesService],
  controllers: [FilesController],
})
export class FilesModule {}