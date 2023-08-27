import { IsEnum, IsString } from "class-validator";
import { TransactionType } from "../../transaction/types";
import { ApiProperty } from '@nestjs/swagger';

export class CategoryCreateDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsEnum(TransactionType)
    transactionType: TransactionType
}