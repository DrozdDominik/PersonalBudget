import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from "./user.service";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { User } from './user.entity';
import { Serialize } from '../interceptors/serialize.interceptor';
import { RegisterResponseDto } from "./dtos/register-response.dto";
import { CurrentUser } from "../decorators/current-user.decorator";
import { UserIdentificationData } from "./types";
import { AuthGuard } from "@nestjs/passport";
import { EditUserDto } from "./dtos/edit-user.dto";
import { EditUserResponseDto } from "./dtos/edit-user-response.dto";

@Controller('user')
export class UserController {
    constructor(
        private usersService: UserService,
    ) {}

    @Serialize(RegisterResponseDto)
    @Post('/')
    createUser(@Body() newUser: RegisterUserDto): Promise<User> {
        return this.usersService.register(newUser);
    }

    @UseGuards(AuthGuard('jwt'))
    @Serialize(EditUserResponseDto)
    @Patch('/:id')
    editUser(
        @Param('id') id: string,
        @Body() editedData: EditUserDto,
        @CurrentUser() user: User
    ): Promise<User> {
        const userData: UserIdentificationData = {
            id: user.id,
            role: user.role
        }

        return this.usersService.edit(id, userData, editedData)
    }
}
