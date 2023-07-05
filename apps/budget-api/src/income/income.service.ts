import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Income } from "./income.entity";
import { Repository } from "typeorm";
import { CreateIncomeDto } from "./dtos/create-income.dto";
import { User } from "../user/user.entity"
import { TransactionIdentificationData } from "../types";
import { UserIdentificationData, UserRole } from "../user/types";

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

    async edit(
        identificationData: TransactionIdentificationData,
        editedData: Partial<CreateIncomeDto>
    ): Promise<Income> {
        const { transactionId, user } = identificationData

        const income = await this.incomeRepository.findOne(
            { where: {id: transactionId},
                relations: {user: true}
            }
        )

        if (!income) {
            throw new NotFoundException()
        }

        if (income.user.id !== user.id && user.role !== UserRole.Admin) {
            throw new ForbiddenException()
        }

        Object.assign(income, editedData)

        return this.incomeRepository.save(income)
    }

    async delete(id: string, user: UserIdentificationData): Promise<boolean> {
        const income = await this.incomeRepository.findOne(
            { where: {id},
                relations: {user: true}
            }
        )

        if (!income) {
            throw new NotFoundException()
        }

        if (income.user.id !== user.id && user.role !== UserRole.Admin) {
            throw new ForbiddenException()
        }

        const { affected} = await this.incomeRepository.delete(income.id)

        return affected === 1
    }
}
