import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { IncomeService } from "./income.service";
import { Income } from "./income.entity";
import { CreateIncomeDto } from "./dtos/create-income.dto";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "../decorators/current-user.decorator";
import { User } from "../user/user.entity";
import { Serialize } from "../interceptors/serialize.interceptor";
import { CreateIncomeResponse } from "./dtos/create-income-response";
import { EditIncomeDto } from "./dtos/edit-income.dto";

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

    @UseGuards(AuthGuard('jwt'))
    @Serialize(CreateIncomeResponse)
    @Post('/edit/:id')
    editIncome(@Param('id') id: string, @Body() data: EditIncomeDto): Promise<Income> {
        return this.incomeService.edit(id, data)
    }
}
