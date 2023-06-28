import { BadRequestException, Injectable } from "@nestjs/common";
import { User } from "../user/user.entity";
import { v4 as uuid } from 'uuid';
import { AuthLoginDto } from "./dtos/auth-login.dto";
import { Response } from 'express';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { createJwtToken } from "./jwt/token";
import { verifyPassword } from "../utils";

@Injectable()
export class AuthService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

    private async generateToken(user: User): Promise<string> {
        let token;
        let userWithThisToken = null;
        do {
            token = uuid();
            userWithThisToken = await this.usersRepository.findOne( {where: {currentToken: token}} );
        } while (!!userWithThisToken);

        user.currentToken = token

        await this.usersRepository.save(user)

        return token;
    };

    async login(req: AuthLoginDto, res: Response): Promise<any> {
        const {email, password} = req

        const user = await this.usersRepository.findOne({where: {email}})

        if (!user) {
            throw new BadRequestException('incorrect credentials');
        }

        if (!await verifyPassword(user.passwordHash, password)) {
            throw new BadRequestException('incorrect credentials');
        }

        const token = await createJwtToken(await this.generateToken(user));

        return res
            .cookie('jwt', token.accessToken, {
                secure: true,
                domain: 'localhost',
                httpOnly: true,
            })
            .json({ok: true});
    };

    async logout(user: User, res: Response) {
        try {
            user.currentToken = null;
            await this.usersRepository.save(user);
            return res
                .clearCookie('jwt',
                {
                    secure: true,
                    domain: 'localhost',
                    httpOnly: true,
                })
                .json({ok: true});
        } catch (e) {
            return res.json({error: e.message});
        }
    }
}