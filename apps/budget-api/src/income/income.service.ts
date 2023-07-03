import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Income } from "./income.entity";
import { Repository } from "typeorm";
import { CreateIncomeDto } from "./dtos/create-income.dto";
import { User } from "../user/user.entity"

@Injectable()
export class IncomeService {
    constructor(
        @InjectRepository(Income)
        private incomeRepository: Repository<Income>
    ) {}

    async create(data: CreateIncomeDto, user: User): Promise<Income> {
        const income = this.incomeRepository.create(data)
        income.user = user
        return this.incomeRepository.save(income)
    }

    async edit(id: string, data: Partial<CreateIncomeDto>): Promise<Income> {
        const income = await this.incomeRepository.findOne( { where: {id}, relations: {user: true}})

        if (!income) {
            throw new NotFoundException()
        }

        Object.assign(income, data)

        return this.incomeRepository.save(income)
    }
}
