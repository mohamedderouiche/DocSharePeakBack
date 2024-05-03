import { Controller, Post, Body, Put, Param, Get, UseInterceptors, UploadedFile, Query, Res, NotFoundException, Delete } from '@nestjs/common';
import { EditorService } from './editor.service';
import { CreateEditorDto, UpdateEditorDto } from './editor.dto';

@Controller('editor')
export class EditorController {
  constructor(private readonly editorService: EditorService) {}

  @Post()
  async create(@Body() createEditorDto: CreateEditorDto) {
    return this.editorService.createPost(createEditorDto.title, createEditorDto.content);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateEditorDto: UpdateEditorDto) {
    return this.editorService.updatePost(id, updateEditorDto.content);
  }

  @Get()
  async getAll() {
    return this.editorService.getAllPosts();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.editorService.getPostById(id);
  }


  @Get(':id/history')
  async getVersionHistory(@Param('id') id: string) {
    return this.editorService.getVersionHistory(id);
  }
  @Delete(':id/clear-history')
  async clearHistory(@Param('id') id: string) {
    return this.editorService.clearHistory(id);
  }

}


