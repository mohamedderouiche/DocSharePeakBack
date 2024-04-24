import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface EditorVersion {
  versionNumber: number;
  title: string;
  data: PostData;
  createdAt: Date;
}
export interface PostData {
    time: number;
    blocks: { id: string; type: string; data: { [key: string]: any } }[];
    version: string;
  }
  
  export type PostDocument = Post & Document;
  
  @Schema()
  export class Post {
    @Prop()
    title: string;
  
    @Prop({ required: true, type: Object })
    data: PostData; // Use the interface here

    @Prop({ type: [Object] }) // Utiliser un tableau d'objets génériques
  versionHistory: EditorVersion[]; 
  }
  

export const PostSchema = SchemaFactory.createForClass(Post);
