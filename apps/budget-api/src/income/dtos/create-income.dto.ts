import { IsDateString, IsNumber, IsString, Min } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateIncomeDto {
    @ApiProperty()
    @IsString()
    categoryName: string;

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