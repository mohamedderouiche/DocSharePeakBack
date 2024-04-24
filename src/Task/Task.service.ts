import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTaskDto } from '../Task/dto/CreateTask.dto';
import { Task } from './schemas/task.schema';
import { Event, EventDocument } from '../Events/event.schemas';
import { Document } from 'src/Document/Schemas/Document.schemas';
import { EmailService } from 'src/Email/email.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
    private readonly emailService: EmailService,
  ) {}

  async createTask(createTaskDto: CreateTaskDto, userEmail: string) {
    const newTask = new this.taskModel(createTaskDto);
    const task = await newTask.save();
  
    // Vérifier si l'Event existe avant de le créer
    const eventExists = await this.eventModel.exists({ _id: task._id });
  
    if (!eventExists) {
      const event = new this.eventModel({
        _id: task._id,
        title: createTaskDto.title,
        start: createTaskDto.start,
        end: createTaskDto.end,
        allDay: createTaskDto.allDay,
      });
      await event.save();
      await this.sendEmail(userEmail, createTaskDto.title);
    }
  
    // Associate Task with Document
    if (createTaskDto.documentId) {
      const document = await this.documentModel.findById(createTaskDto.documentId);
      if (!document) {
        throw new NotFoundException(`Document with ID ${createTaskDto.documentId} not found`);
      }
      document.tasks.push(task._id);
      await document.save();
    }
  
   // Send email only if the end date is exactly one day after the current date
const endDate = new Date(createTaskDto.end);
const currentDate = new Date();
const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
const differenceInDays = Math.floor((endDate.getTime() - currentDate.getTime()) / oneDay);
if (differenceInDays === 1) {
  await this.sendEmailOneDayBefore(userEmail, createTaskDto.title, endDate);
}
  
    return task;
  }
  

  async getTasks() {
    return this.taskModel.find();
  }

  async getTaskById(id: string) {
    return this.taskModel.findById(id);
  }

  async updateTask(id: string, updateTaskDto: CreateTaskDto) {
    const updatedTask = await this.taskModel.findByIdAndUpdate(id, updateTaskDto, { new: true });

    // Mettre à jour l'événement correspondant
    if (updatedTask) {
      await this.eventModel.findByIdAndUpdate(id, {
        title: updateTaskDto.title,
        start: updateTaskDto.start,
        end: updateTaskDto.end,
        allDay: updateTaskDto.allDay,
      });
    }

    return updatedTask;
  }

  async deleteTask(id: string) {
    // Supprimer l'événement correspondant
    await this.eventModel.findByIdAndDelete(id);
    await this.documentModel.updateMany(
      {},
      { $pull: { tasks: id } },
      { multi: true }
    );
    return this.taskModel.findByIdAndDelete(id);
  }

  async getEvents() {
    return this.eventModel.find();
  }

  async getTasksByIds(taskIds: string[]): Promise<Task[]> {
    const tasks = await this.taskModel.find({ _id: { $in: taskIds } });
    return tasks;
  }

  async getTasksByDocumentId(documentId: string): Promise<Task[]> {
    const document = await this.documentModel.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const tasksIds = document.tasks.map(taskId => taskId.toString());
    const fullTasks = await this.getTasksByIds(tasksIds);

    return fullTasks;
  }
  async sendEmail(userEmail: string, taskTitle: string) {
      
    const mailOptions = {
      from: 'docsharepeak@gmail.com',
      to: userEmail,
      subject: 'Added task ' + taskTitle,
      html: this.emailService.exportMail("A new task has been added ","http://localhost:3000/Calendar"),
    };

    try {
      const info = await this.emailService.sendMailtoStudent(userEmail,mailOptions.from, mailOptions.subject, mailOptions.html);
      console.log('Email sent: ' + userEmail);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
  async sendEmailOneDayBefore(userEmail: string, taskTitle: string, endDate: Date) {
    const mailOptions = {
      from: 'docsharepeak@gmail.com',
      to: userEmail,
      subject: 'Reminder: Task Deadline Tomorrow',
      html: `Your task "${taskTitle}" is due tomorrow. Please make sure to complete it on time.`,
    };

    try {
      const info = await this.emailService.sendMailtoStudent(userEmail, mailOptions.from, mailOptions.subject, mailOptions.html);
      console.log('Reminder email sent: ' + userEmail);
    } catch (error) {
      console.error('Error sending reminder email:', error);
    }
  }
}
