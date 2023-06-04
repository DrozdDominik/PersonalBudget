import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from "./services/users.service";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { User } from './user.entity';
import { AuthService } from "./services/auth.service";

@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService,
        private authService: AuthService
        ) {}

    @Post('/signup')
    createUser(@Body() newUser: RegisterUserDto): Promise<User> {
        return this.authService.register(newUser);
    }
}
