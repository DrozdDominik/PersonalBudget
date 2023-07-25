import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./category.entity";
import { Repository } from "typeorm";
import { CategoryNameDto } from "./dtos/category-name.dto";
import { CategoryCreateData } from "./types";
import { User } from "../user/user.entity";
import { CustomCategoryIdentificationData } from "../types";

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>
    ) {}

    async findDefaultByName(name: string): Promise<Category | null> {
        return await this.categoryRepository.findOne({
            where: {
                name: name.toLowerCase(),
                isDefault: true,
            }
        })
    }

    async findByUserAndName(name: string, userId: string):Promise<Category | null> {
        return await this.categoryRepository.findOne({
            where: {
                name: name.toLowerCase(),
                user: {
                    id: userId
                }
            }
        })
    }

    async findCustomById(id: string, userId: string) {
        return await this.categoryRepository.findOne({
            relations: {
                incomes: true,
                user: true,
            },
            where: {
                id,
                isDefault: false,
                user: {
                    id: userId
                }
            }
        })
    }

    async findDefaultOrCustomByUserAndName(name: string, userId: string): Promise<Category> {
        const defaultCategory = await this.findDefaultByName(name)

        if (defaultCategory) {
            return defaultCategory
        }

        const category = await this.findByUserAndName(name,userId)

        if (!category) {
            throw  new NotFoundException()
        }

        return category
    }

    async findDefaultById(id: string) {
        return await this.categoryRepository.findOne({
            relations: {incomes: true},
            where: {
                id,
                isDefault: true,
                user: null
            }
        })
    }

    async createDefault(data: CategoryNameDto) {
        const defaultCategory = await this.findDefaultByName(data.name)

        if (defaultCategory) {
            throw new BadRequestException()
        }

        const newCategoryData: CategoryCreateData = {
            name: data.name.toLowerCase(),
            isDefault: true,
            user: null,
        }

        const newDefaultCategory = this.categoryRepository.create(newCategoryData)
        return this.categoryRepository.save(newDefaultCategory)
    }

    async create(data: CategoryNameDto, user: User) {
        const defaultCategory = await this.findDefaultByName(data.name)

        if (defaultCategory) {
            throw new BadRequestException()
        }

        const category = await this.findByUserAndName(data.name, user.id)

        if (category) {
            throw new BadRequestException()
        }

        const newCategoryData: CategoryCreateData = {
            name: data.name.toLowerCase(),
            isDefault: false,
            user,
        }

        const newCategory = this.categoryRepository.create(newCategoryData)
        return this.categoryRepository.save(newCategory)
    }


    async delete(id: string, userId: string) {
        const category = await this.findCustomById(id, userId)

        if (!category) {
            throw new NotFoundException()
        }

        const { affected } = await this.categoryRepository.delete(category.id)

        return affected === 1
    }

    async deleteDefault(id: string) {
        const defaultCategory = await this.findDefaultById(id)

        if (!defaultCategory) {
            throw new NotFoundException()
        }

        const { affected } = await this.categoryRepository.delete(defaultCategory.id)

        return affected === 1
    }

    async edit(identificationData: CustomCategoryIdentificationData, name: string) {
        const {categoryId, userId} = identificationData

        const category = await this.findCustomById(categoryId,userId)

        if (!category) {
            throw new NotFoundException()
        }

        category.name = name

        return await this.categoryRepository.save(category)
    }
}
