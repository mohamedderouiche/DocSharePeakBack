import { IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
    @IsNotEmpty()
    title: string;

    description: string;

    status: string;

  start: Date;

  
  end: Date;

  
  allDay: boolean;

  documentId: string;
}
