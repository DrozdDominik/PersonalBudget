import { IsDateString, IsNumber, IsUUID, Min } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { CategoryId } from "../../category/types";

export class CreateIncomeDto {
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
}