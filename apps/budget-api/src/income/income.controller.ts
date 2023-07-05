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
import { TransactionIdentificationData } from "../types";

@Controller('income')
export class IncomeController {
    constructor(
        private incomeService: IncomeService
    ) {}

    @UseGuards(AuthGuard('jwt'))
    @Serialize(CreateIncomeResponse)
    @Post('/')
    createIncome(@Body() newIncome: CreateIncomeDto, @CurrentUser() user: User): Promise<Income> {
        return this.incomeService.create(newIncome, user)
    }

    @UseGuards(AuthGuard('jwt'))
    @Serialize(CreateIncomeResponse)
    @Patch('/:id')
    editIncome(
        @Param('id') id: string,
        @Body() editedData: EditIncomeDto,
        @CurrentUser() user: User
    ): Promise<Income> {
        const identificationData: TransactionIdentificationData = {
            transactionId: id,
            user: {
                id: user.id,
                role: user.role
            }
        }
        return this.incomeService.edit(identificationData, editedData)
    }
}
