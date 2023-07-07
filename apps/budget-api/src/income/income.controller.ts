import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IncomeService } from "./income.service";
import { Income } from "./income.entity";
import { CreateIncomeDto } from "./dtos/create-income.dto";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "../decorators/current-user.decorator";
import { User } from "../user/user.entity";
import { Serialize } from "../interceptors/serialize.interceptor";
import { IncomeResponse } from "./dtos/income-response";
import { EditIncomeDto } from "./dtos/edit-income.dto";
import { TransactionIdentificationData } from "../types";
import { UserIdentificationData } from "../user/types";

@Controller('income')
export class IncomeController {
    constructor(
        private incomeService: IncomeService
    ) {}

    @UseGuards(AuthGuard('jwt'))
    @Serialize(IncomeResponse)
    @Post('/')
    createIncome(@Body() newIncome: CreateIncomeDto, @CurrentUser() user: User): Promise<Income> {
        return this.incomeService.create(newIncome, user)
    }

    @UseGuards(AuthGuard('jwt'))
    @Serialize(IncomeResponse)
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

    @UseGuards(AuthGuard('jwt'))
    @Delete('/:id')
    deleteIncome(
        @Param('id') id: string,
        @CurrentUser() user: User
    ): Promise<boolean> {
        const userData: UserIdentificationData = {
            id: user.id,
            role: user.role
        }

        return this.incomeService.delete(id, userData)
    }

    @UseGuards(AuthGuard('jwt'))
    @Serialize(IncomeResponse)
    @Get('/')
    getAll(@CurrentUser() user: User): Promise<Income[]> {
        const userData: UserIdentificationData = {
            id: user.id,
            role: user.role
        }
        return this.incomeService.getAll(userData)
    }

    @UseGuards(AuthGuard('jwt'))
    @Serialize(IncomeResponse)
    @Get('/:id')
    getOne(
        @Param('id') id: string,
        @CurrentUser() user: User
    ): Promise<Income> {
        const userData: UserIdentificationData = {
            id: user.id,
            role: user.role
        }
        return this.incomeService.getOne(id,userData)
    }
}
