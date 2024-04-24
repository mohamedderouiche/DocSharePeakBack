import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EditorController } from './editor.controller';
import { EditorService } from './editor.service';
import { Post, PostSchema } from './post.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }])],
  controllers: [EditorController],
  providers: [EditorService], // Include the EditorService
  exports: [EditorService], // Export the EditorService
})
export class EditorModule {}
