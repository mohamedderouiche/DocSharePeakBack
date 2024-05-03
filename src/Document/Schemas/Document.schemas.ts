import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, SchemaTypes, Types } from 'mongoose';
import { Post } from 'src/editor/post.schema';
import {  Schema as MongooseSchema } from 'mongoose';
import { FileImport } from 'src/ImportFiles/file.schemas';

export interface DocumentVersion {
  versionNumber: number;
  name: string;
  title: string;
  createdAt: Date;
  note?: string;
}

import { Event} from '../../Events/event.schemas';

@Schema()
export class Task extends Event{
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop()
    status: string; // Can be 'todo', 'inProgress', 'done', etc.

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now })
    updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);


@Schema()
export class Document extends MongooseDocument {
  @Prop()
  name: string;

  @Prop()
  title: string;

  @Prop()
  userEmail: string;

  @Prop({ type: [Object] })
  versionHistory: DocumentVersion[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop()
  note?: string;

 
  @Prop({ type: Buffer }) // Utiliser un type Buffer pour stocker les données du fichier
  data: Buffer;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post' })
  post: Post;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Task' }] })
   tasks: Types.Array<Task>;

   @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'FileImport' }] })
   files: Types.Array<FileImport>;

  
}

export const DocumentSchema = SchemaFactory.createForClass(Document);
