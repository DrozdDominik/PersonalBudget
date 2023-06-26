import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { NewUserData } from "./types";
import { InjectRepository } from "@nestjs/typeorm";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { hashPassword } from "../utils";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {}

    async create(newUserData: NewUserData): Promise<User> {
        const user = this.usersRepository.create(newUserData)

        return this.usersRepository.save(user)
    }

    async findOneById(id: string) {
        return this.usersRepository.findOne({where: {id}});
    }

    async findOneByEmail(email: string): Promise<User> {
        return this.usersRepository.findOne({where: {email}})
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        const user = await this.findOneById(id)

        if (!user) {
            throw new NotFoundException('user not found');
        }

        Object.assign(user, data)
        return this.usersRepository.save(user)
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find()
    }

    async register(data: RegisterUserDto) {
        const user = await this.findOneByEmail(data.email)

        if (!!user) {
            throw new BadRequestException('email is use')
        }

        const passwordHash = await hashPassword(data.password)

        const newUserData: NewUserData = {
            name: data.name,
            email: data.email,
            passwordHash,
        }

        return await this.create(newUserData)
    }
}