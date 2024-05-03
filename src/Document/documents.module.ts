// DocumentsModule
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentController } from './documents.controller';
import { DocumentService } from './documents.service';
import { Document, DocumentSchema } from './Schemas/Document.schemas';
import { EditorModule } from '../editor/editor.module';
import { Workspace , WorkspaceSchema} from '../workspace/workspace.schema';
import { EmailService } from '../Email/email.service';
import { RealTimeGateway } from 'src/realtimeNotif/realtime.gateway';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Document.name,
        schema: DocumentSchema,
      },
    ]),
    EditorModule,
    MongooseModule.forFeature([{ name: Workspace.name, schema: WorkspaceSchema }]),

  ],
  providers: [DocumentService,EmailService,RealTimeGateway],
  controllers: [DocumentController],
  exports: [DocumentService],
})
export class DocumentsModule {}