import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDocumentDto } from '../Document/dto/CreateDocument.dto';
import { UpdateDocumentDto } from '../Document/dto/UpdateDocument.dto';
import { DocumentService } from './documents.service';
import { Response } from 'express';
import { Document } from './Schemas/Document.schemas';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('create')
  @UsePipes(new ValidationPipe())
  async create(@Body() createDocumentDto: CreateDocumentDto) {
    const newDocument = await this.documentService.createDocument(createDocumentDto);

    return newDocument;
  }
  
  @Get('getAll')
  async findAll() {
    return this.documentService.getDocuments();
  }

  @Get('getById/:id')
  async findOne(@Param('id') id: string) {
    return this.documentService.getDocumentById(id);
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentService.updateDocument(id, updateDocumentDto);
  }

  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    return this.documentService.deleteDocumentById(id);
  }


@Get('download/:id')
async downloadFile(@Param('id') id: string, @Res() res: Response) {
  const fileContent = await this.documentService.getFileContent(id);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.slideshow');
  res.setHeader('Content-Disposition', 'attachment; filename=document.pptx');

  res.send(fileContent);
}

@Delete('cleanVersions/:id')
async cleanVersions(@Param('id') id: string, @Body('option') option: string, @Body('versionsToDelete') versionsToDelete: number[]) {
  const cleanedDocument = await this.documentService.cleanVersions(id, option, versionsToDelete);
  return cleanedDocument;
}

@Get('/:workspaceName')
async getDocumentsByWorkspaceName(@Param('workspaceName') workspaceName: string): Promise<Document[]> {
  try {
    const documents: Document[] = await this.documentService.getDocumentsByWorkspaceName(workspaceName);
    return documents;
  } catch (error) {
    throw new NotFoundException(error.message);
  }
}

}
