import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskController } from '../Task/Task.controller';
import { Task, TaskSchema } from '../Task/Schemas/Task.schema';
import { Event, EventSchema } from '../Events/event.schemas'; 
import { Document, DocumentSchema } from 'src/Document/Schemas/Document.schemas';
import { TaskService } from './task.service';
import { EmailService } from 'src/Email/email.service';
import { User, UserSchema } from 'src/users/schemas/user.schema';


@Module({
  imports: [
    
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]), 
    MongooseModule.forFeature([{ name: Document.name, schema: DocumentSchema }]), 
    MongooseModule.forFeature([
      {
           name: User.name,
            schema: UserSchema, 
      }
  ]),

  ],
  controllers: [TaskController],
  providers: [TaskService,EmailService],

})
export class TaskModule {}
