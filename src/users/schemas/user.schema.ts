/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  // @Prop({ index: true })
  // name: string;

  @Prop({ index: true })
  full_name: string;

  @Prop({ index: true })
  phone: string;


 
  // @Prop()
  // country: string;

  // @Prop()
  // province_state: string;

  // @Prop()
  // address: string;

  // @Prop()
  // rereferred_by: string;

  @Prop({ unique: true, index: true })
  email: string;

  @Prop()
  qrCodeDataUrl:string;

  @Prop()
  password: string;

  @Prop()
  isVerify: boolean;

  @Prop({
    type: [String], // Définir le type comme un tableau de chaînes
    // enum: ['admin', 'user', 'vendedor'],
    default: [], // Définir la valeur par défaut comme un tableau avec 'user'
  })
  role: string[]; // Déclarer le type comme un tableau de chaînes
  
  @Prop({ type: Buffer }) // Utiliser un type Buffer pour stocker les données du fichier
  data: Buffer;

 

  @Prop() 
  image: string;

  @Prop()
  twoFactorSecret: string;
  
  @Prop()
  imagePath?: string; 

  @Prop()
  hashdRt: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

const UserSchema = SchemaFactory.createForClass(User);

export { UserSchema };