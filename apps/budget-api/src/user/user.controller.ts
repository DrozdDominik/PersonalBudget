import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { UserService } from './user.service'
import { RegisterUserDto } from './dtos/register-user.dto'
import { User } from './user.entity'
import { Serialize } from '../interceptors/serialize.interceptor'
import { RegisterResponseDto } from './dtos/register-response.dto'
import { CurrentUser } from '../decorators/current-user.decorator'
import { UserId, UserIdentificationData } from './types'
import { AuthGuard } from '@nestjs/passport'
import { EditUserDto } from './dtos/edit-user.dto'
import { EditUserResponseDto } from './dtos/edit-user-response.dto'

@Controller('user')
export class UserController {
  constructor(private usersService: UserService) {}

  @Serialize(RegisterResponseDto)
  @Post('/')
  createUser(@Body() newUser: RegisterUserDto): Promise<User> {
    return this.usersService.register(newUser)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(EditUserResponseDto)
  @Patch('/:id')
  editUser(
    @Param('id') id: UserId,
    @Body() editedData: EditUserDto,
    @CurrentUser() user: User,
  ): Promise<User> {
    const userData: UserIdentificationData = {
      id: user.id,
      role: user.role,
    }

    return this.usersService.edit(id, userData, editedData)
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id') id: UserId, @CurrentUser() user: User): Promise<void> {
    const userData: UserIdentificationData = {
      id: user.id,
      role: user.role,
    }

    return this.usersService.delete(id, userData)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:id')
  getUser(@Param('id') id: UserId, @CurrentUser() user: User): Promise<User> {
    const userData: UserIdentificationData = {
      id: user.id,
      role: user.role,
    }

    return this.usersService.get(id, userData)
  }
}
