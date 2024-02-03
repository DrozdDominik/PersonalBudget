import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { User } from '../user/user.entity'
import { AuthLoginDto } from './dtos/auth-login.dto'
import { Response } from 'express'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from '../decorators/current-user.decorator'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @HttpCode(200)
  async loginUser(@Body() credentials: AuthLoginDto, @Res() res: Response): Promise<User> {
    return this.authService.login(credentials, res)
  }

  @Get('/logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@CurrentUser() user: User, @Res() res: Response) {
    return this.authService.logout(user, res)
  }
}
