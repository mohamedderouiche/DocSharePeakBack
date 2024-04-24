import { Injectable } from '@nestjs/common';
import { Event } from './event.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Task } from 'Task/Schemas/task.schema';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Event.name) private eventModel: Model<Event>) {}
  
  async create(event: Event): Promise<Event> {
    const newEvent = new this.eventModel(event);
    return await newEvent.save();
  }

  async findAll(): Promise<Event[]> {
    return await this.eventModel.find().exec();
  }

  async remove(id: string): Promise<Event> {
    const objectId = new ObjectId(id);
    return await this.eventModel.findByIdAndDelete(objectId);
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
}
