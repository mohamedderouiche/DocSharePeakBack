import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Post, EditorVersion, PostDocument } from './post.schema';

@Injectable()
export class EditorService {
  constructor(@InjectModel(Post.name) private readonly postModel: Model<PostDocument>) {}

  async createPost(title: string, content: string): Promise<PostDocument> {
    if (!content) {
      throw new BadRequestException('Content is required');
    }

    const newPost = new this.postModel({ title, data: { content }, versionHistory: [] });
    const savedPost = await newPost.save();
    return savedPost;
  }

  async updatePost(id: string, newContent: string): Promise<PostDocument> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const newVersion: EditorVersion = {
      versionNumber: post.versionHistory.length + 1,
      title: post.title,
      data: { content: newContent },
      createdAt: new Date(),
    };

    post.versionHistory.push(newVersion);
    post.title = newVersion.title;
    post.data = newVersion.data;

    return await post.save();
  }

  async getAllPosts(): Promise<PostDocument[]> {
    return this.postModel.find().lean().exec();
  }

  async getPostById(id: string): Promise<PostDocument> {
    return this.postModel.findById(id).lean().exec();
  }

  async getVersionHistory(id: string): Promise<EditorVersion[]> {
    if (!id) {
      throw new NotFoundException('Invalid id');
    }
  
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }
  
    return post.versionHistory;
  }
  
  async clearHistory(id: string): Promise<PostDocument> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }
  
    post.versionHistory = [];
    return await post.save();
  }
  
}
