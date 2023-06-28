import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from "./auth.service";
import { User } from "../user/user.entity";
import { AuthLoginDto } from "./dtos/auth-login.dto";
import { Response } from 'express';
import { AuthGuard } from "@nestjs/passport";
import { UserObj } from "../decorators/user-obj.decorator";


@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    @Post('/login')
    async loginUser(@Body() credentials: AuthLoginDto,  @Res() res: Response,): Promise<User> {
        return this.authService.login(credentials, res);
    }

    @Get('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(@UserObj() user: User, @Res() res: Response) {
        return this.authService.logout(user, res);
    }

}
