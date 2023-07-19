import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Income } from "./income.entity";
import { Repository } from "typeorm";
import { CreateIncomeDto } from "./dtos/create-income.dto";
import { User } from "../user/user.entity"
import { TransactionIdentificationData } from "../types";
import { UserIdentificationData, UserRole } from "../user/types";
import { CategoryService } from "../category/category.service";

@Injectable()
export class IncomeService {
    constructor(
        @InjectRepository(Income)
        private incomeRepository: Repository<Income>,
        @Inject(CategoryService) private categoryService: CategoryService,
    ) {}

    async create(data: CreateIncomeDto, user: User): Promise<Income> {
        const { categoryName, ...incomeData} = data

        const category = await this.categoryService.findDefaultOrCustomByUserAndName(categoryName, user.id)

        const income = this.incomeRepository.create(incomeData)

        income.user = user
        income.category = category

        return this.incomeRepository.save(income)
    }

    async edit(
        identificationData: TransactionIdentificationData,
        editedData: Partial<CreateIncomeDto>
    ): Promise<Income> {
        const { transactionId, user } = identificationData

        const income = await this.getOne(transactionId, user)

        const { categoryName, ...dataToEdit } = editedData

        Object.assign(income, dataToEdit)

        if (!!categoryName) {
             const category = await this.categoryService.findDefaultOrCustomByUserAndName(
                categoryName,
                user.id
            )

            Object.assign(income.category, category)
        }

        return this.incomeRepository.save(income)
    }

    async delete(id: string, user: UserIdentificationData): Promise<boolean> {
        const income = await this.getOne(id, user)

        const { affected } = await this.incomeRepository.delete(income.id)

        return affected === 1
    }

    async getOne(id: string, user: UserIdentificationData): Promise<Income> {
        const income = await this.incomeRepository.findOne(
            { where: {id},
                relations: {
                user: true,
                category: true,
                }
            }
        )

        if (!income) {
            throw new NotFoundException()
        }

        if (income.user.id !== user.id && user.role !== UserRole.Admin) {
            throw new ForbiddenException()
        }

        return income
    }

    async getAll(user: UserIdentificationData): Promise<Income[]> {
       return user.role === UserRole.Admin
           ?
           await this.incomeRepository.find({
              relations: {
                  user: true,
                  category: true,
              },
          })
           :
           await this.incomeRepository.find({
               relations: {
                   user: true,
                   category: true
               },
               where: {
                   user: {
                       id: user.id
                   }
               }
           })
   }
}
