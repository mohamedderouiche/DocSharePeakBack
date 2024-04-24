import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workspace } from '../workspace/workspace.schema';
import * as bcrypt from 'bcrypt';
import { WorkspaceDto } from '../auth/dto/workspace.dto';
import { DocumentService } from '../Document/documents.service';


@Injectable()
export class WorkspaceService {
    constructor(@InjectModel(Workspace.name) private readonly workspaceModel: Model<Workspace>,private readonly documentService:DocumentService,
    ) {}


    // async sendEmail(userEmail: string, WorkspaceName: string) {
      
    //   const mailOptions = {
    //     from: 'docsharepeak@gmail.com',
    //     to: userEmail,
    //     subject: 'Added To Workspace'+WorkspaceName ,  
    //     html: `Monsieur/Madame,\n\nYour have been added to "${WorkspaceName}"  : $\n\nCordialement`,
    //   };
  
    //   try {
    //     const info = await this.emailService.sendMailtoStudent(userEmail,mailOptions.from, mailOptions.subject, mailOptions.html);
    //     console.log('Email sent: ' + userEmail);
    //   } catch (error) {
    //     console.error('Error sending email:', error);
    //   }
    // }


    async create(workspace: WorkspaceDto): Promise<Workspace> {
        const createdWorkspace = new this.workspaceModel(workspace);
        createdWorkspace.createdAt = new Date(); 
        return await createdWorkspace.save();
      }
    
      async findAll(): Promise<any[]> {
        try {
          const workspaces = await this.workspaceModel.find().exec();
          const hashedWorkspaces = await Promise.all(workspaces.map(async (workspace) => {
            const hashedCode = await bcrypt.hash(workspace.code, 10);
            return { ...workspace.toObject(), code: hashedCode };
          }));
          return hashedWorkspaces;
        } catch (error) {
          // Handle error
          throw new Error('Error while finding workspaces');
        }
      }
    
      async findOne(id: string): Promise<Workspace> {
        const workspace = await this.workspaceModel.findById(id).exec();
        if (!workspace) {
          throw new NotFoundException(`User with id ${id} not found`);
        }
        return workspace;
      }
    
      async update(id: string, workspace: Workspace): Promise<Workspace> {
        const updatedWorkspace = await this.workspaceModel.findByIdAndUpdate(id, workspace, { new: true }).exec();
        if (!updatedWorkspace) {
          throw new NotFoundException(`User with id ${id} not found`);
        }
        return updatedWorkspace;
      }
    
      async remove(id: string): Promise<Workspace> {
        const deletedWorkspace = await this.workspaceModel.findByIdAndDelete(id).exec();
        if (!deletedWorkspace) {
          throw new NotFoundException(`Workspace not found`);
        }
        return deletedWorkspace;
      }

      

     
      
      
    //   async addDocumentAndAssignToWorkspace(workspacename: string, document: Document) {
    //     const workspace = await this.workspaceModel.findOne({ name: workspacename });
    
    //     if (!workspace) {
    //         throw new Error(`Workspace with name '${workspacename}' not found`);
    //     }
    
    //     const createdDocument = await this.documentService.createDocument(document);
    //     workspace.documents.push(createdDocument);
    //     await workspace.save();
    
    //     return workspace;
    // }
    // async getDocumentsByWorkspaceName(workspacename: string) {
    //     const workspace = await this.workspaceModel.findOne({ name: workspacename });
    
    //     if (!workspace) {
    //         throw new Error(`Workspace with name '${workspacename}' not found`);
    //     }
    //     return workspace.documents;
    // }
  //   async findDocumentAndUpdateByWorkspaceName(workspacename: string, documentId: string, updateDocumentDto: UpdateDocumentDto) {
  //     const workspace = await this.workspaceModel.findOne({ name: workspacename });
  
  //     if (!workspace) {
  //         throw new Error(`Workspace with name '${workspacename}' not found`);
  //     }
  
  //     const document = workspace.documents.find(doc => doc._id.toString() === documentId);
  
  //     if (!document) {
  //         throw new Error(`Document with id '${documentId}' not found in workspace '${workspacename}'`);
  //     }
  
  //     // Call the updateDocument function with document ID and DTO
  //     const updatedDocument = await this.documentService.updateDocument(documentId, updateDocumentDto);
  
  //     return updatedDocument;
  // }
  
}
