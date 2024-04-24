/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuthDto } from './../auth/dto/auth.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Put, Query } from '@nestjs/common/decorators';


@Controller({
  path: 'users',
  version: '1.0',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Post('data/admin')
  async createAdmin(@Body() createUserDto: AuthDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(@Query() q: string) {
    return await this.usersService.findAll(q);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.updateOne(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.delete(id);
  }



  @Put('update-nom/:id')
    async updateFullName(@Param('id') userId: string, @Body('full_name') fullName: string): Promise<void> {
        try {
            await this.usersService.updateOne(userId, { full_name: fullName });
        } catch (error) {
            if (error instanceof NotFoundException) {
                // Gérer l'erreur de l'ID de l'utilisateur non trouvé
                throw new NotFoundException('Utilisateur non trouvé.');
            } else {
                // Gérer d'autres erreurs
                throw new Error('Une erreur est survenue lors de la mise à jour du nom de l\'utilisateur.');
            }
        }
    }
    @Put('addWorkspaceToUserRole')
  async addWorkspaceToUserRole(@Body() requestBody: { email: string, workspaceName: string }) {
    const { email, workspaceName } = requestBody;
    try {
      const updatedUser = await this.usersService.addWorkspaceToUserRole(email, workspaceName);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Put( 'removeWorkspaceFromUserRole/:userEmail/:workspaceName' )
  async removeWorkspaceFromUserRole(@Param('userEmail') userEmail: string, @Param('workspaceName')  workspaceName: string) {
 return this.usersService.DeleteWorkspaceFromUserRole( userEmail,workspaceName);
  }


  @Put(':id/deactivate')
  async deactivateAccount(@Param('id') userId: string) {
    try {
      await this.usersService.desactiverAccount(userId, { isVerify: false });
      return { success: true, message: 'Account deactivated successfully.' };
    } catch (error) {
      return { success: false, message: 'Failed to deactivate account.' };
    }
  }

  //**********************************************************/
  @Cron('0 0 * * *')
  async cleanupUnverifiedUsers() {
    try {
      // Supprimez les utilisateurs non vérifiés créés il y a plus de 15 jours
      await this.usersService.deleteUnverifiedUsersCreatedBefore(15);
      console.log('User cleanup task completed successfully.');
    } catch (error) {
      console.error('Failed to cleanup unverified users:', error.message);
    }
  }
  //**********************************************************/


  // @Put('activate')
  // async activateAccount(@Body() credentials: { email: string; password: string }) {
  //   try {
  //     const { email, password } = credentials;
      
  //     // Vérifiez si l'utilisateur existe et que le mot de passe est correct
  //     const user = await this.usersService.findByEmailAndPassword(email, password);

  //     if (!user) {
  //       return { success: false, message: 'Email or password is incorrect.' };
  //     }

  //     // Mettez à jour le compte pour le marquer comme activé
  //     await this.usersService.updateOne(user.id, { isVerify: true });

  //     return { success: true, message: 'Account activated successfully.' } ;
  //   } catch (error) {
  //     return { success: false, message: 'Failed to activate account.' };
  //   }
  // }

}
 