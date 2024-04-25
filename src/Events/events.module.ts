import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event, EventSchema } from './event.schemas';
import { Task, TaskSchema } from '../Task/Schemas/Task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    MongooseModule.forFeature([
        {
             name: Event.name,
              schema: EventSchema, 
        }
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  
})
export class EventsModule {}
