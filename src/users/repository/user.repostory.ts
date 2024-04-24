/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { AuthDto } from 'src/auth/dto/auth.dto';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: AuthDto): Promise<User> {
   
    const createdUser = new this.userModel(createUserDto);
    createdUser.isVerify=false;
    return createdUser.save();
  }

  async findAll(query: { q: string }): Promise<User[]> {
    let filters: mongoose.FilterQuery<UserDocument> = {
      $or: [
        { full_name: new RegExp(query.q, 'i') },
        { email: new RegExp(query.q, 'i') },
      ],
    };

    if (!query.q) {
      filters = {};
    }

    let result = await this.userModel.find(filters).sort({ createdAt: -1 })

    return result
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email: email }).exec();
  }

  async updateOne(userId: string, data: any) {
    this.userModel.updateOne({ _id: userId }, { $set: data }).exec();
  }

  async findById(userId: string) {
    return this.userModel.findById(userId).exec();
  }

  async delete(id: string) {
    return await this.userModel.deleteMany({ _id: id });
  }

  async save(user: any): Promise<User> {
    return user.save();
  }

  

  // async findOneAndUpdate(query: any, update: any, options: any): Promise<any> {
  //   return this.userModel.findOneAndUpdate(query, update, options).exec();
  // }
  async findOneAndUpdate(query: any, update: any, options: any): Promise<any> {
    try {
      const updatedUser = await this.userModel.findOneAndUpdate(query, update, options).exec();
      
      
      if (!updatedUser) {
        throw new NotFoundException('Utilisateur non trouvé');
      }
      
      return updatedUser;
    } catch (error) {
      // Gérer les erreurs de mise à jour ici
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur : ${error.message}`);
    }
  }


  async findOne(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ where: { email } });
  }
  

  async find(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findUnverifiedUsers(): Promise<User[]> {
    return this.userModel.find({ isVerify: false }).exec();
  }
  
  
}