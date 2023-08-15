import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./category.entity";
import { Repository } from "typeorm";
import { CategoryNameDto } from "./dtos/category-name.dto";
import { CategoryCreateData, CategoryId } from "./types";
import { User } from "../user/user.entity";
import { CustomCategoryIdentificationData } from "../types";
import { IncomeService } from "../income/income.service";
import { UserId } from "../user/types";

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        @Inject(forwardRef( () => IncomeService)) private incomeService: IncomeService,
    ) {}

    async findDefaultByName(name: string): Promise<Category | null> {
        return await this.categoryRepository.findOne({
            where: {
                name: name.toLowerCase(),
                isDefault: true,
            }
        })
    }

    async findCustomByUserAndName(name: string, userId: UserId):Promise<Category | null> {
        return await this.categoryRepository.findOne({
            where: {
                name: name.toLowerCase(),
                user: {
                    id: userId
                }
            }
        })
    }

    async findCustomById(id: CategoryId, userId: UserId) {
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

    async findDefaultOrCustomByUserAndId(id: CategoryId, userId: UserId): Promise<Category> {
        const defaultCategory = await this.findDefaultById(id)

        if (defaultCategory) {
            return defaultCategory
        }

        const category = await this.findCustomById(id, userId)

        if (!category) {
            throw  new NotFoundException()
        }

        return category
    }

    async findDefaultById(id: CategoryId) {
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
        const savedNewDefaultCategory = await this.categoryRepository.save(newDefaultCategory)

        const customCategories = await this.getAllCustomByName(savedNewDefaultCategory.name)

        if (customCategories.length > 0) {
            customCategories.map(async category => {
                const incomes = await this.incomeService.getAllByCategory(category.id, category.user.id)
                await Promise.all(incomes.map( income => {
                    income.category.id = savedNewDefaultCategory.id
                    return this.incomeService.save(income)
                } ) )
            })

            const deleteResult = await Promise.all(customCategories.map(
                async category => {
                    return this.delete(category.id, category.user.id)
                }
            ))

            const isAllDeleted = deleteResult.filter(result => !result).length === 0

            if (!isAllDeleted) {
                throw new Error('Deleting categories went wrong...')
            }
        }

        return savedNewDefaultCategory
    }

    async create(data: CategoryNameDto, user: User) {
        const defaultCategory = await this.findDefaultByName(data.name)

        if (defaultCategory) {
            throw new BadRequestException()
        }

        const category = await this.findCustomByUserAndName(data.name, user.id)

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


    async delete(id: CategoryId, userId: UserId) {
        const category = await this.findCustomById(id, userId)

        if (!category) {
            throw new NotFoundException()
        }

        const { affected } = await this.categoryRepository.delete(category.id)

        return affected === 1
    }

    async deleteDefault(id: CategoryId) {
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

        const exitsUserCategory = await this.findCustomByUserAndName(name, userId)

        if (exitsUserCategory) {
            throw new BadRequestException(`User category ${name} already exits`)
        }

        category.name = name

        return await this.categoryRepository.save(category)
    }

    async editDefault(id: CategoryId, name: string) {
        const defaultCategory = await this.findDefaultById(id)

        if (!defaultCategory) {
            throw new NotFoundException()
        }

        const exitsDefaultCategory = await this.findDefaultByName(name)

        if (exitsDefaultCategory) {
            throw new BadRequestException(`Default category ${name} already exits`)
        }

        defaultCategory.name = name

        return await this.categoryRepository.save(defaultCategory)
    }

    async getAll(userId: UserId): Promise<Category[]> {
        return await this.categoryRepository.find({
            relations: {user: true},
            where: {
                user: {
                    id: userId
                }
            }
        })
    }

    async getAllDefault(): Promise<Category[]> {
        return await this.categoryRepository.find({
            where: {
                isDefault: true
            }
        })
    }

    async getAllAvailable(userId: UserId): Promise<Category[]> {
        return await this.categoryRepository.find({
            relations: {user: true},
            where: [
                {isDefault: true},
                {user: {id: userId}}
            ]
        })
    }

    async getAllCustomByName(name: string): Promise<Category[]> {
        return await this.categoryRepository.find({
            relations: {user: true},
            where: {
                name,
                isDefault: false,
            }
        })
    }
}
