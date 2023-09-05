import { IsDateString, IsNumber, IsUUID, Min, IsOptional, IsString, IsEnum } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { CategoryId } from "../../category/types";
import { TransactionType } from "../types";
import { BudgetId } from "../../budget/types";

export class CreateTransactionDto {
    @ApiProperty()
    @IsEnum(TransactionType)
    type: TransactionType;

    @ApiProperty()
    @IsUUID()
    categoryId: CategoryId;

    @ApiProperty()
    @IsNumber({
        maxDecimalPlaces: 2,
        })
    @Min(0.01)
    amount: number;

    @ApiProperty()
    @IsDateString({strict: true})
    date: Date;

    @ApiProperty()
    @IsOptional()
    @IsString()
    comment?: string

    @ApiProperty()
    @IsUUID()
    budgetId: BudgetId;
}