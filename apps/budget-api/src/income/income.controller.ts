import { Body, Controller, Post } from '@nestjs/common';
import { IncomeService } from "./income.service";
import { Income } from "./income.entity";
import { CreateIncomeDto } from "./dtos/create-income.dto";

@Controller('income')
export class IncomeController {
    constructor(
        private incomeService: IncomeService
    ) {}

    @Post('/add')
    createIncome(@Body() newIncome: CreateIncomeDto): Promise<Income> {
        return this.incomeService.create(newIncome)
    }
}
