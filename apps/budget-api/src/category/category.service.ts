import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./category.entity";
import { Repository } from "typeorm";
import { CreateCategoryDto } from "./dtos/create-category.dto";
import { CategoryCreateData } from "./types";

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>
    ) {}

    async findByName(name: string): Promise<Category | null> {
        return await this.categoryRepository.findOne({
            where: {
                name: name.toLowerCase()
            }
        })
    }

    async createDefault(data: CreateCategoryDto) {
        const category = await this.findByName(data.name)

        if (category) {
            throw new BadRequestException()
        }

        const newCategoryData: CategoryCreateData = {
            name: data.name.toLowerCase(),
            isDefault: true,
            user: null,
        }

        const newCategory = this.categoryRepository.create(newCategoryData)
        return this.categoryRepository.save(newCategory)
    }
}
