import { PartialType } from "@nestjs/swagger"
import { CreateIncomeDto } from "./create-income.dto";

export class EditIncomeDto extends PartialType(CreateIncomeDto) {}