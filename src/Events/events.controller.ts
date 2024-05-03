import { Controller, Get, Post, Body, Delete, Param, Put, NotFoundException } from '@nestjs/common';
import { Event } from './event.schemas';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  async findAll(): Promise<Event[]> {
    return this.eventsService.findAll();
  }

  @Post(':emailUser')
  async create(@Body() event: Event, @Param('emailUser') emailUser: string ): Promise<Event> {
    return this.eventsService.create(event,emailUser);
  }

  @Put(':id') // Ajout de la méthode pour mettre à jour un événement
  async updateEvent(@Param('id') id: string, @Body() event: Event) {
    try {
      const updatedEvent = await this.eventsService.update(id, event);
      return { message: 'Event updated successfully', updatedEvent };
    } catch (error) {
      throw new Error(`Error updating event: ${error.message}`);
    }
  }

  @Delete(':id')
  async removeEvent(@Param('id') id: string) {
    try {
      const deletedEvent = await this.eventsService.remove(id);
      return { message: 'Event deleted successfully', deletedEvent };
    } catch (error) {
      throw new Error(`Error deleting event: ${error.message}`);
    }
  }

  @Get('/getbyuseremail/:emailUser')
async getEventsByUserId(@Param('emailUser') emailUser: string): Promise<Event[]> {
  try {
    const events: Event[] = await this.eventsService.getEventsByUserEmail(emailUser);
    return events;
  } catch (error) {
    throw new NotFoundException(error.message);
  }
}
}
