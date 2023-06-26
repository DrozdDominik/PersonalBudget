import { Strategy } from 'passport-jwt';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { config } from "../config/config";
import { Repository } from "typeorm";
import { User } from "../user/user.entity";
import { InjectRepository } from "@nestjs/typeorm";

export interface JwtPayload {
    token: string;
}

function cookieExtractor(req: Request): null | string {
    return (req && req.cookies) ? (req.cookies?.jwt ?? null) : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {
        super({
            jwtFromRequest: cookieExtractor,
            secretOrKey: config.jwt.jwtSecret
        });
    }

    async validate(payload: JwtPayload, done: (error, user) => void) {
        if (!payload || !payload.token) {
            return done(new UnauthorizedException(), false);
        }

        const user = await this.usersRepository.findOne( { where: { currentToken: payload.token } } );
        if (!user) {
            return done(new NotFoundException(), false);
        }

        done(null, user);
    }
}