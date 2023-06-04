import { Injectable } from '@nestjs/common';
import { Repository } from "typeorm";
import { User } from "../user.entity";
import { NewUserData } from "../types";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {}

    async create(newUserData: NewUserData): Promise<User> {
        const user = this.usersRepository.create(newUserData)

        return this.usersRepository.save(user)
    }

    async findOneByEmail(email: string): Promise<User> {
        return this.usersRepository.findOne({where: {email}})
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find()
    }
}