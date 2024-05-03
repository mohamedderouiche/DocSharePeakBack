/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserSchema, User } from './schemas/user.schema';
import { UserRepository } from './repository/user.repostory';
import { Workspace, WorkspaceSchema } from 'src/workspace/workspace.schema';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { EmailService } from 'src/Email/email.service';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: Workspace.name, schema: WorkspaceSchema }, ]),
    WorkspaceModule,
    JwtModule.register({}),
  ],
  exports: [MongooseModule, UserRepository, UsersService],
  providers: [UsersService, UserRepository, EmailService],
  controllers: [UsersController],
})
export class UsersModule {
}