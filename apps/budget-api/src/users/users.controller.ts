import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from "./users.service";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { User } from './user.entity';
import { AuthService } from "../auth/auth.service";
import { Serialize } from '../interceptors/serialize.interceptor';
import { RegisterResponseDto } from "../auth/dtos/register-response.dto";

@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService,
        private authService: AuthService
        ) {}

    @Serialize(RegisterResponseDto)
    @Post('/signup')
    createUser(@Body() newUser: RegisterUserDto): Promise<User> {
        return this.authService.register(newUser);
    }
}
