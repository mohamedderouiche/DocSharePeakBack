import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileImport } from './file.schemas';
import { Stream } from 'stream';
import * as BufferList from 'bl';
import { Document } from 'src/Document/Schemas/Document.schemas';


@Injectable()
export class FilesService {
  constructor(
    @InjectModel(FileImport.name) private FileModel: Model<FileImport>,
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,

  ) {}

  async saveFileToDatabase(file: Express.Multer.File,  documentId: string) {
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(file.buffer);

    const bl = new BufferList();
    await new Promise((resolve, reject) => {
      bufferStream.pipe(bl).on('finish', resolve).on('error', reject);
    });
    const bufferData = bl.slice();

    const newFile = new this.FileModel({
      name: file.originalname,
      contentType: file.mimetype,
      size: file.size,
      data: bufferData,
    });

    const savedFile = await newFile.save();

    const document = await this.documentModel.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Document not found`);
    }

    document.files.push(savedFile._id); // Ajoutez l'ID du fichier au tableau files
    await document.save();

    return savedFile._id;
  }

  async getFileContent(id: string): Promise<Buffer> {
    const file = await this.FileModel.findById(id);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file.data;
  }

  async getFiles() {
    return this.FileModel.find();
  }

  async getFileById(id: string) {
    return this.FileModel.findById(id);
  }

  async deleteFileById(id: string) {
    const deletedFile = await this.FileModel.findByIdAndDelete(id);

    if (!deletedFile) {
      throw new NotFoundException('File not found');
    }

    // Remove the file from all documents
    await this.documentModel.updateMany(
      { files: id },
      { $pull: { files: id } },
    );

    return deletedFile;
  }

  async getFilesByDocId(documentId: string) {
    const document = await this.documentModel.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Document not found`);
    }

    const fileIds = document.files.map(file => file.toString());
    const files = await this.FileModel.find({ _id: { $in: fileIds } });

    return files;
  }
}
