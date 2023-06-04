import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from "./services/users.service";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { User } from './user.entity';
import { AuthService } from "./services/auth.service";
import { Serialize } from '../interceptors/serialize.interceptor';
import { RegisterUserResponseDto } from "./dtos/register-user-response.dto";

@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService,
        private authService: AuthService
        ) {}

    @Serialize(RegisterUserResponseDto)
    @Post('/signup')
    createUser(@Body() newUser: RegisterUserDto): Promise<User> {
        return this.authService.register(newUser);
    }
}
