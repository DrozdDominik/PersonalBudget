import { PartialType } from '@nestjs/swagger'
import { RegisterUserDto } from './register-user.dto'

export class EditUserDto extends PartialType(RegisterUserDto) {}