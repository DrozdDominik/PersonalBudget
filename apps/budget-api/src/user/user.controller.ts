import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from "./user.service";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { User } from './user.entity';
import { Serialize } from '../interceptors/serialize.interceptor';
import { RegisterResponseDto } from "../auth/dtos/register-response.dto";

@Controller('user')
export class UserController {
    constructor(
        private usersService: UserService,
    ) {}

    @Serialize(RegisterResponseDto)
    @Post('/register')
    createUser(@Body() newUser: RegisterUserDto): Promise<User> {
        return this.usersService.register(newUser);
    }
}
