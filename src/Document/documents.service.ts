import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateDocumentDto } from '../Document/dto/CreateDocument.dto';
import { UpdateDocumentDto } from '../Document/dto/UpdateDocument.dto';
import { Document, DocumentVersion } from './Schemas/Document.schemas';
import { EditorService } from '../editor/editor.service';
import { Workspace } from '../workspace/workspace.schema';
import { EmailService } from '../Email/email.service';

@Injectable()
export class DocumentService {

  private transporter;

  constructor(
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
    private readonly editorService: EditorService,
    @InjectModel(Workspace.name) private readonly workspaceModel: Model<Workspace>,
    private readonly emailService: EmailService,
  ) {
 


  async sendEmail(userEmail: string, documentName: string, documentId: Types.ObjectId) {
    const documentLink = this.generateDocumentLink(documentId.toString());

    const mailOptions = {
      from: 'docsharepeak@gmail.com',
      to: userEmail,
      subject: 'Document Créé avec Succès',
      html: `Monsieur/Madame,\n\nVotre document "${documentName}" a été créé avec succès.\n\nVous pouvez consulter votre document ici : ${documentLink}\n\nCordialement,\nVotre Application`,
    };

    try {
      const info = await this.emailService.sendMailtoStudent(userEmail,mailOptions.from, mailOptions.subject, mailOptions.html);
      console.log('Email sent: ' + userEmail);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
  
  generateDocumentLink(documentId: string): string {
    const frontendUrl = 'http://localhost:3000';
    return `${frontendUrl}/details/${documentId}`;
  }

  async createDocument(createDocumentDto: CreateDocumentDto) {
    const newDocument = new this.documentModel(createDocumentDto);
  
    if (createDocumentDto.note) {
      newDocument.note = createDocumentDto.note;
    }
  
    const savedDocument = await newDocument.save();
    const documentId = savedDocument._id;
  
    // Create editor here
    const newEditor = await this.editorService.createPost(createDocumentDto.title, createDocumentDto.name);
    // Associate editor with the document
    savedDocument.post = newEditor._id;
    await savedDocument.save();
  
    // Add document to workspace by name
    const workspaceName = createDocumentDto.workspaceName; // Assuming workspaceName is provided in the CreateDocumentDto
    const workspace = await this.workspaceModel.findOne({ name: workspaceName });
    if (!workspace) {
      throw new NotFoundException(`Workspace with name ${workspaceName} not found`);
    }
  
    // Update the workspace with the new document ID
    await this.workspaceModel.findOneAndUpdate(
      { name: workspaceName },
      { $push: { documents: documentId } },
      { new: true }
    );
  
    await this.sendEmail(
      createDocumentDto.userEmail,
      createDocumentDto.name,
      documentId,
    );
  
    return savedDocument;
  }
  

  async getDocuments() {
    return this.documentModel.find();
  }

  async getDocumentById(id: string) {
    return this.documentModel.findById(id);
  }

  async updateDocument(id: string, updateDocumentDto: UpdateDocumentDto) {
    const existingDocument = await this.documentModel.findById(id);
  
    if (!existingDocument) {
      throw new Error('Document not found');
    }
  
    const newVersion: DocumentVersion = {
      versionNumber: existingDocument.versionHistory.length + 1,
      name: existingDocument.name,
      title: existingDocument.title,
      createdAt: existingDocument.updatedAt,
      note: existingDocument.note,
    };
  
    existingDocument.versionHistory.push(newVersion);
  
    if (updateDocumentDto.name) {
      existingDocument.name = updateDocumentDto.name;
    }
  
    if (updateDocumentDto.title) {
      existingDocument.title = updateDocumentDto.title;
    }
  
    if (updateDocumentDto.note) {
      existingDocument.note = updateDocumentDto.note;
    }
  
    existingDocument.updatedAt = new Date();
  
    const savedDocument = await existingDocument.save();
  
    return savedDocument;
  }
  
  async deleteDocumentById(id: string) {
    const document = await this.documentModel.findByIdAndDelete(id);
    if (!document) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }

    // Remove the document from the workspace
    await this.workspaceModel.updateMany(
      {},
      { $pull: { documents: id } },
      { multi: true }
    );

    return document;
  }

  formatDate(date: Date): Date {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return new Date(year, month - 1, day, hours, minutes);
  }

  async getFileContent(id: string): Promise<Buffer> {
    const document = await this.documentModel.findById(id);

    if (!document) {
      throw new Error('Document not found');
    }

    return document.data;
  }

  async cleanVersions(id: string, option: string, versionsToDelete: number[]) {
    const document = await this.documentModel.findById(id);

    if (!document) {
      throw new Error('Document not found');
    }

    if (option === 'Delete All') {
      document.versionHistory = [];
    } else if (option === 'Select to delete') {
      if (!versionsToDelete || versionsToDelete.length === 0) {
        throw new Error('No versions provided for deletion');
      }

      document.versionHistory = document.versionHistory.filter(
        version => !versionsToDelete.includes(version.versionNumber)
      );
    } else {
      throw new Error('Invalid option');
    }

    const savedDocument = await document.save();
    return savedDocument;
  }

  async getDocumentsByIds(documentIds: string[]): Promise<Document[]> {
    const documents = await this.documentModel.find({ _id: { $in: documentIds } });
    return documents;
  }

  async getDocumentsByWorkspaceName(workspaceName: string): Promise<Document[]> {
    const workspace = await this.workspaceModel.findOne({ name: workspaceName });
    if (!workspace) {
      throw new NotFoundException(`Workspace with name ${workspaceName} not found`);
    }
  
    // Obtenez les IDs des documents dans le workspace
    const documentIds = workspace.documents.map(doc => doc.toString());
  
    // Obtenez les documents complets
    const fullDocuments = await this.getDocumentsByIds(documentIds);
  
    return fullDocuments;
  }
}
