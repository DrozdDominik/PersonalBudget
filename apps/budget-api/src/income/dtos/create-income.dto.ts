import { IsDateString, IsNumber, IsString, Min } from "class-validator";

export class CreateIncomeDto {
    @IsString()
    name: string;

    @IsNumber({
        maxDecimalPlaces: 2,
        })
    @Min(0.01)
    amount: number;

    @IsDateString({strict: true})
    date: Date;
}