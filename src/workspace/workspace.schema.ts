import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from '../Document/Schemas/Document.schemas';

export type WorkspaceDocument = Workspace & Document;

import * as bcrypt from 'bcrypt';
import { SchemaTypes, Types } from 'mongoose';

@Schema()
export class Workspace {

  @Prop()
  name: string;

  @Prop()
   code: string;
   @Prop()
   description:string;

   @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Document' }] })
   documents: Types.Array<Document>;

   
   @Prop()
   createdAt:Date;

   async getCode() {
    console.log('Code:', this.code); // Log the value of this.code
    const hashcode = await bcrypt.hash(this.code, 10);
    return hashcode;
  }




  
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
