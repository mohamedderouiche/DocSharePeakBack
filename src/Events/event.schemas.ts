import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

@Schema()
export class Event {
  @Prop()
  title: string;

  @Prop()
  start: Date;

  @Prop()
  end: Date;

  @Prop()
  allDay: boolean;
}

export const EventSchema = SchemaFactory.createForClass(Event);
