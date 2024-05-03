import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event, EventSchema } from './event.schemas';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    MongooseModule.forFeature([
        {
             name: Event.name,
              schema: EventSchema, 
        }
    ]),
    MongooseModule.forFeature([
      {
           name: User.name,
            schema: UserSchema, 
      }
  ]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  
})
export class EventsModule {}
