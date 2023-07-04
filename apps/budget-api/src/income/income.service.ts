import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Income } from "./income.entity";
import { Repository } from "typeorm";
import { CreateIncomeDto } from "./dtos/create-income.dto";
import { User } from "../user/user.entity"
import { TransactionIds } from "../types";

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

    async edit(ids: TransactionIds, data: Partial<CreateIncomeDto>): Promise<Income> {
        const income = await this.incomeRepository.findOne( { where: {id: ids.transactionId}, relations: {user: true}})

        if (!income) {
            throw new NotFoundException()
        }

        if (income.user.id !== ids.userId) {
            throw new ForbiddenException()
        }

        Object.assign(income, data)

        return this.incomeRepository.save(income)
    }
}
