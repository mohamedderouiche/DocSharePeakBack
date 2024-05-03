import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { CreateTaskDto } from './dto/CreateTask.dto';
import { TaskService } from 'src/Task/task.service';
import { Task } from './Schemas/task.schema';

@Controller('tasks')
export class TaskController {
    constructor(private taskService: TaskService) {}

    @Post()
    createTask(@Body() createTaskDto: CreateTaskDto,@Body('userEmail')userEmail: string) {
        return this.taskService.createTask(createTaskDto,userEmail);
    }

    @Get('/:documentId')
    async getDocumentsByWorkspaceName(@Param('documentId') documentId: string): Promise<Task[]> {
        try {
            const tasks: Task[] = await this.taskService.getTasksByDocumentId(documentId);
            return tasks;
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    @Get()
    getTasks() {
        return this.taskService.getTasks();
    }

    @Get(':id')
    getTaskById(@Param('id') id: string) {
        return this.taskService.getTaskById(id);
    }

    @Patch(':id')
    updateTask(@Param('id') id: string, @Body() updateTaskDto: CreateTaskDto) {
        return this.taskService.updateTask(id, updateTaskDto);
    }

    @Delete(':id')
    deleteTask(@Param('id') id: string) {
        return this.taskService.deleteTask(id);
    }
}
