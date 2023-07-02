import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IncomeService } from "./income.service";
import { Income } from "./income.entity";
import { CreateIncomeDto } from "./dtos/create-income.dto";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "../decorators/current-user.decorator";
import { User } from "../user/user.entity";
import { Serialize } from "../interceptors/serialize.interceptor";
import { CreateIncomeResponse } from "./dtos/create-income-response";

@Controller('income')
export class IncomeController {
    constructor(
        private incomeService: IncomeService
    ) {}

    @UseGuards(AuthGuard('jwt'))
    @Serialize(CreateIncomeResponse)
    @Post('/add')
    createIncome(@Body() newIncome: CreateIncomeDto, @CurrentUser() user: User): Promise<Income> {
        return this.incomeService.create(newIncome, user)
    }
}
