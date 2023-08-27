import { CategoryCreateDto } from "./category-create.dto";
import { PartialType } from "@nestjs/swagger";

export class CategoryEditDto extends PartialType(CategoryCreateDto) {}