import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface EditorVersion {
  versionNumber: number;
  title: string;
  data: PostData;
  createdAt: Date;
}

export interface PostData {
  content: string; // Assuming Quill content is stored as HTML string
}

export type PostDocument = Post & Document;

@Schema()
export class Post {
  @Prop()
  title: string;

  @Prop({ required: true, type: Object })
  data: PostData;

  @Prop({ type: [Object] })
  versionHistory: EditorVersion[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
