import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from "./auth.service";
import { Serialize } from '../interceptors/serialize.interceptor';
import { RegisterResponseDto } from "./dtos/register-response.dto";
import { User } from "../users/user.entity";
import { RegisterUserDto } from "../users/dtos/register-user.dto";


@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    @Serialize(RegisterResponseDto)
    @Post('/signup')
    createUser(@Body() newUser: RegisterUserDto): Promise<User> {
        return this.authService.register(newUser);
    }
}
