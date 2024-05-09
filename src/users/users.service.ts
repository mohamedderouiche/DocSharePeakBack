/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { UserRepository } from './repository/user.repostory';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from 'src/auth/dto/update-password.dto';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Workspace } from 'src/workspace/workspace.schema';
import { EmailService } from 'src/Email/email.service';
import { LessThan } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';

import { unlinkSync } from 'fs';

@Injectable()
export class UsersService {
  [x: string]: any;
  constructor(private readonly userRepository: UserRepository,@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  @InjectModel(Workspace.name) private readonly workspaceModel: Model<Workspace>,
  private readonly emailService: EmailService,
  private jwtService: JwtService,
  ) {}

  async create(createUserDto: AuthDto): Promise<User> {
    createUserDto.password = await this.hashPassword(createUserDto.password);
    createUserDto.isVerify=false;
    const createdUser = await this.userRepository.create(createUserDto);
    return createdUser;
  }

  async findAll(q: any): Promise<User[]> {
    return await this.userRepository.findAll(q);
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findUserByEmail(email);
  }

  


  async updateOne(userId: string, data: UpdateUserDto) {
    await this.userRepository.updateOne(userId, data);
  }

  async findById(userId: string) {
    return await this.userRepository.findById(userId);
  }

  async delete(id: string) {
    return await this.userRepository.delete(id);
  }

  async hashPassword(data: string) {
    return bcrypt.hash(data, 10);
  }


  async updatePassword(email: string, newPassword: string): Promise<User> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
    }
    user.password = newPassword;
    await this.userRepository.save(user);   
    return user;
}

async updatePasswordOldNew(email: string, newPassword: string, oldPassword: string): Promise<User> {
  const user = await this.userRepository.findUserByEmail(email);

  if (!user) {
    throw new NotFoundException('Utilisateur non trouvé');
  }

  const passwordMatches = await bcrypt.compare(oldPassword, user.password);
  
  if (!passwordMatches) {
    throw new Error('Ancien mot de passe incorrect');
  }

  user.password = newPassword;
  await this.userRepository.save(user);

  return user;
}



  findOneAndUpdate(query: any, update: any, options: any){
    return this.userRepository.findOneAndUpdate(query, update, options)
  }




  async addRoleToDocument(userEmail: string,name:String){
    const user = await this.userModel.findOne({ email: userEmail });
    if (!user) {
      throw new Error('User not found');
    }
  
      user.role.push("AdminDocument"+name)

    

    return await user.save();
  }

  async addWorkspaceToUserRole(userEmail: string, workspaceName: string,isAdmin:boolean,isAdminDocument:boolean): Promise<User> {
    const user = await this.userModel.findOne({ email: userEmail });
    if (!user) {
      throw new Error('User not found');
    }

    const workspace = await this.workspaceModel.findOne({ name: workspaceName });
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!user.role.includes(workspaceName)) {
      user.role.push(workspaceName);
      if(isAdmin){
        user.role.push("Admin"+workspaceName)
      }
     
      await this.sendEmail(
        userEmail,
        workspaceName,
        
      );
    } 
   
    
    else {
      throw new Error('Workspace already added to user role');
    }

    return await user.save();
  }

  async DeleteWorkspaceFromUserRole(userEmail: string, workspaceName: string): Promise<User> {
    const user = await this.userModel.findOne({ email: userEmail });
    if (!user) {
      throw new Error('User not found');
    }

    const workspace = await this.workspaceModel.findOne({ name: workspaceName });
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (user.role.includes(workspaceName)) {
      let index = user.role.indexOf(workspaceName);
      if (index !== -1) {
        user.role.splice(index, 1);
    }
     
    } 
    
    else {
      throw new Error('Workspace already added to user role');
    }

    return await user.save();
  }

  async sendEmail(userEmail: string, WorkspaceName: string) {
      
    const mailOptions = {
      from: 'docsharepeak@gmail.com',
      to: userEmail,
      subject: 'Added To Workspace'+WorkspaceName ,  
      html: this.emailService.exportMail("You Have been Added To "+WorkspaceName,"http://localhost:3000/"+WorkspaceName),
    };

    try {
      const info = await this.emailService.sendMailtoStudent(userEmail,mailOptions.from, mailOptions.subject, mailOptions.html);
      console.log('Email sent: ' + userEmail);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
  async desactiverAccount(userId: string, data: any) {
    const user = await this.userRepository.findById(userId);
    // Modifier les données pour définir isVerify sur false
    const updatedData = { ...data, isVerify: false };
    // Appeler la méthode updateOne avec les données modifiées
    await this.userRepository.updateOne(userId, updatedData);
    await this.sendMailForActivate(user.email, user.full_name);
  }
  async sendMailForActivate(email: string, fullname: string): Promise<void> {
    const secretKey = 'qsdsqdqdssqds';
    const token = this.jwtService.sign(
      { email },
      { secret: secretKey, expiresIn: '16d' },
    );

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'contact.fithealth23@gmail.com',
        pass: 'ebrh bilu ygsn zrkw',
      },
    });

    const msg = {
      from: {
        name: 'Active your account',
        address: 'contact.fithealth23@gmail.com',
      },
      to: email,
      subject: ' Account Confirmation',
      // html: `<b><b>HI ${fullname} ? <a href="https://reactprojectdeploy.vercel.app/auth/activate/${token}">Activate Your Account</a></b>`,
      html: `<b><b>HI ${fullname} ? <a href="http://localhost:3000/authentication/activation/${token}">Re-Activate Your Account</a></b>`
    };
    
    try {
      await transporter.sendMail(msg);
      console.log('Email has been sent!');
    } catch (error) {
      console.error(error);
    }
  }
  
    async findByEmailAndPassword(email: string, password: string): Promise<User | null> {
      // Utilisez le userRepository pour rechercher un utilisateur par email
      const user = await this.userRepository.findOne(email );
  
      // Vérifiez si l'utilisateur existe et si le mot de passe est correct
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (user && passwordMatches) {
        return user; // Retournez l'utilisateur s'il est trouvé et le mot de passe est correct
      }
  
      return null; // Retournez null si l'utilisateur n'est pas trouvé ou le mot de passe est incorrect
    }


    // **************cleanup*****************************
    async deleteUnverifiedUsersCreatedBefore(days: number): Promise<void> {
      try {
        // Calculer la date il y a 15 jours
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
      
        // Supprimer les utilisateurs non vérifiés créés avant la date de coupure
        await this.userModel.deleteMany({ isVerify: false, createdAt: { $lt: cutoffDate } }).exec();
      } catch (error) {
        // Gérer les erreurs ici
        throw new Error(`Erreur lors de la suppression des utilisateurs non vérifiés : ${error.message}`);
      }
    }

    // async deleteUnverifiedUsersCreatedBefore(): Promise<void> {
    //   try {
    //     // Calculer la date il y a 15 jours
    //     const cutoffDate = new Date();
    //     cutoffDate.setDate(cutoffDate.getDate() - 15);
      
    //     // Trouver les utilisateurs non vérifiés créés avant la date de coupure
    //     const unverifiedUsers = await this.userRepository.findUnverifiedUsers();
    
    //     // Filtrer les utilisateurs dont la date de création est antérieure à la date de coupure
    //     const usersToDelete = unverifiedUsers.filter(user => user.createdAt < cutoffDate);
    
    //     // Supprimer les utilisateurs trouvés
    //     for (const user of usersToDelete) {
    //       await this.userModel.deleteOne({ _id: user._id }).exec();
    //     }
    //   } catch (error) {
    //     // Gérer les erreurs ici
    //     throw new Error(`Erreur lors de la suppression des utilisateurs non vérifiés : ${error.message}`);
    //   }
    // }

    async updateProfileImage(userId: string, image: Express.Multer.File): Promise<User> {
      const user = await this.userModel.findById(userId);
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      let imageUrl: string | undefined;
      if (image) {
        if (user.image) {
          unlinkSync(user.image);
        }
        imageUrl = image.path;
        await this.userModel.updateOne({ _id: userId }, { image: imageUrl });
      }
  
      return await this.userModel.findById(userId);
    }
  }  