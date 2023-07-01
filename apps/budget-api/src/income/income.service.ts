import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Income } from "./income.entity";
import { Repository } from "typeorm";
import { CreateIncomeDto } from "./dtos/create-income.dto";

@Injectable()
export class IncomeService {
    constructor(
        @InjectRepository(Income)
        private incomeRepository: Repository<Income>
    ) {}

    async create(data: CreateIncomeDto): Promise<Income> {
        const income = this.incomeRepository.create(data)
        return this.incomeRepository.save(income)
    }
}
