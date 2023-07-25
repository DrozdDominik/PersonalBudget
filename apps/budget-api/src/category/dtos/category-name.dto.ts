import { IsString } from "class-validator";

export class CategoryNameDto {
    @IsString()
    name: string;
}