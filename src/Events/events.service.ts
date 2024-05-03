import { Injectable, NotFoundException } from '@nestjs/common';
import { Event } from './event.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Task } from 'src/Task/Schemas/task.schema';
import { User } from 'src/users/schemas/user.schema';


@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(User.name) private readonly userModel: Model<User>,) {}
  
  async create(event: Event,emailUser : string ): Promise<Event> {
    const newEvent = new this.eventModel(event);
    const  createdEvent = await newEvent.save();

    const user = await this.userModel.findOne({ email: emailUser });
    if (!user) {
      throw new NotFoundException(`User email not found`);
    }

    user.events.push(createdEvent._id); // Ajoutez l'ID du fichier au tableau files
    await user.save();
       return  createdEvent;
  }

  async findAll(): Promise<Event[]> {
    return await this.eventModel.find().exec();
  }

  async remove(id: string): Promise<Event> {
    const objectId = new ObjectId(id);
    const  event = await this.eventModel.findByIdAndDelete(objectId);

    await this.userModel.updateMany(
      {},
      { $pull: { events: id } },
      { multi: true }
    );
    return event;
  }

  async update(id: string, updatedEvent: Event): Promise<Event> {
    const objectId = new ObjectId(id);
    const updated = await this.eventModel.findByIdAndUpdate(objectId, updatedEvent, { new: true });

    // Mettre à jour la tâche correspondante
    if (updated) {
      await this.taskModel.findByIdAndUpdate(id, {
        title: updatedEvent.title,
        start: updatedEvent.start,
        end: updatedEvent.end,
        allDay: updatedEvent.allDay,
      });
    }

    return updated;
  }


  async getEventsByIds(eventIds: string[]): Promise<Event[]> {
    const events = await this.eventModel.find({ _id: { $in: eventIds } });
    return events;
  }

  async getEventsByUserEmail(userEmail: string): Promise<Event[]> {
      const user = await this.userModel.findOne({ email: userEmail });
      if (!user) {
        throw new NotFoundException(`user not found`);
      }
    
      // Obtenez les IDs des documents dans le workspace
      const eventIds = user.events.map(doc => doc.toString());
    
      // Obtenez les documents complets
      const fullevents = await this.getEventsByIds(eventIds);
    
      return fullevents;
    }
}
