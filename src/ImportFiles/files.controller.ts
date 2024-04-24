import { Controller, Get, Post, Delete, Param, UseInterceptors, UploadedFile, Res, Body, NotFoundException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('ImportFile')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const fileContent = await this.filesService.getFileContent(id);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.slideshow');
    res.setHeader('Content-Disposition', 'attachment; filename=document.pptx');

    res.send(fileContent);
  }

  @Post('/upload/:documentId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Param('documentId') documentId: string ) {
    try {
      const fileId = await this.filesService.saveFileToDatabase(file, documentId);
      return { fileId };
    } catch (error) {
      throw error; // Retourne l'erreur d'origine pour un meilleur débogage
    }
  }

  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    return this.filesService.deleteFileById(id);
  }

  @Get('getAll')
  async findAll() {
    return this.filesService.getFiles();
  }

  @Get('getById/:id')
  async findOne(@Param('id') id: string) {
    return this.filesService.getFileById(id);
  }

  @Get('/:documentId')
  async getFilesByDocumentId(@Param('documentId') documentId: string) {
    try {
      const files = await this.filesService.getFilesByDocId(documentId);
      return files;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
