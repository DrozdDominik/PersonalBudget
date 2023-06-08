import { UsersService } from "../users/users.service";
import { RegisterUserDto } from "../users/dtos/register-user.dto";
import { BadRequestException, Injectable } from "@nestjs/common";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from 'util';
import { NewUserData } from "../users/types";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async register(data: RegisterUserDto) {
        const user = await this.usersService.findOneByEmail(data.email)

        if (!!user) {
            throw new BadRequestException('email is use')
        }

        const salt = randomBytes(8).toString('hex')

        const hash = ( await scrypt(data.password, salt, 32) ) as Buffer

        const result = `${hash.toString('hex')}.${salt}`

        const newUserData: NewUserData = {
            name: data.name,
            email: data.email,
            passwordHash: result,
        }

        return await this.usersService.create(newUserData)
    }
}