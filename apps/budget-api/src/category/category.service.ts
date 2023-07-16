import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./category.entity";
import { Repository } from "typeorm";
import { CreateCategoryDto } from "./dtos/create-category.dto";
import { CategoryCreateData } from "./types";
import { User } from "../user/user.entity";

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

    async findByUserAndName(name: string, userId: string) {
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
            relations: {incomes: true},
            where: {
                id,
                isDefault: false,
                user: {
                    id: userId
                }
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

    async create(data: CreateCategoryDto, user: User) {
        const defaultCategory = await this.findByName(data.name)

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
}
