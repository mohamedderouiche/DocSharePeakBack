import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FileDocument = FileImport & Document;

@Schema()
export class FileImport {
    @Prop()
    name: string;

    @Prop()
    contentType: string;
  
    @Prop()
    size: number;
  
    @Prop({ type: Buffer }) // Utiliser un type Buffer pour stocker les données du fichier
    data: Buffer;
}

export const FileSchema = SchemaFactory.createForClass(FileImport);
