import { Module } from '@nestjs/common';
import { DataBaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { EventsModule } from './Events/events.module';
import { FilesModule } from './ImportFiles/files.module';
import { DocumentsModule } from './Document/documents.module';
import { RolesModule } from './roles/roles.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ChatGateway } from './chat/chat.gateway';
import { EditorModule } from './editor/editor.module';
import { TaskModule } from './Task/Task.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DataBaseModule,
    AuthModule,
    TaskModule,
    UsersModule,
    RolesModule,
    DocumentsModule,
    EventsModule,
    FilesModule,
    WorkspaceModule,
    EditorModule,
    MulterModule.register({
      dest: './documentFiles', // Destination folder for uploaded files
    }),
  ],
  providers: [ChatGateway],
})
export class AppModule {}