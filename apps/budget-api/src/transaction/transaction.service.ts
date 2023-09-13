import {
    BadRequestException,
    ForbiddenException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction } from "./transaction.entity";
import { Repository } from "typeorm";
import { CreateTransactionDto } from "./dtos/create-transaction.dto";
import { User } from "../user/user.entity"
import { TransactionIdentificationData } from "../types";
import { UserId, UserIdentificationData, UserRole } from "../user/types";
import { CategoryService } from "../category/category.service";
import { CategoryId } from "../category/types";
import { TransactionId } from "./types";
import { BudgetService } from "../budget/budget.service";

@Injectable()
export class TransactionService {
    constructor(
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        @Inject(forwardRef( () => CategoryService) ) private categoryService: CategoryService,
        @Inject(forwardRef( () => BudgetService) ) private budgetService: BudgetService,
    ) {}

    async create(data: CreateTransactionDto, user: User): Promise<Transaction> {
        const { categoryId, budgetId, ...transactionData} = data

        const budget = await this.budgetService.checkUserAccessToBudget(budgetId, user.id)

        if (!budget) {
            throw new NotFoundException('There is no such budget')
        }

        const category = await this.categoryService.findDefaultOrCustomByUserAndId(categoryId, user.id)

        if (!category) {
            throw new NotFoundException('There is no such category ')
        }

        if (category.transactionType !== data.type) {
            throw new BadRequestException(`${category.name} is ${category.transactionType} category not ${data.type}`)
        }

        const transaction = this.transactionRepository.create(transactionData)

        transaction.user = user
        transaction.category = category
        transaction.budget = budget

        return this.transactionRepository.save(transaction)
    }

    async edit(
        identificationData: TransactionIdentificationData,
        editedData: Partial<CreateTransactionDto>
    ): Promise<Transaction> {
        const { transactionId, user } = identificationData

        const transaction = await this.getOne(transactionId, user)

        const { categoryId, ...dataToEdit } = editedData

        Object.assign(transaction, dataToEdit)

        if (!!categoryId) {
             const category = await this.categoryService.findDefaultOrCustomByUserAndId(
                categoryId,
                user.id
            )

            if (!category) {
                throw new BadRequestException()
            }

            Object.assign(transaction.category, category)
        }

        return this.transactionRepository.save(transaction)
    }

    async delete(id: TransactionId, user: UserIdentificationData): Promise<boolean> {
        const transaction = await this.getOne(id, user)

        const { affected } = await this.transactionRepository.delete(transaction.id)

        return affected === 1
    }

    async getOne(id: TransactionId, user: UserIdentificationData): Promise<Transaction> {
        const transaction = await this.transactionRepository.findOne(
            { where: {id},
                relations: {
                user: true,
                category: true,
                }
            }
        )

        if (!transaction) {
            throw new NotFoundException()
        }

        if (transaction.user.id !== user.id && user.role !== UserRole.Admin) {
            throw new ForbiddenException()
        }

        return transaction
    }

    async getAll(user: UserIdentificationData): Promise<Transaction[]> {
       return user.role === UserRole.Admin
           ?
           await this.transactionRepository.find({
              relations: {
                  user: true,
                  category: true,
              },
          })
           :
           await this.transactionRepository.find({
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

   async getAllByCategory(categoryId: CategoryId, userId: UserId): Promise<Transaction[]> {
        return await this.transactionRepository.find({
            relations: {
                user: true,
                category: true
            },
            where: {
                user: {
                    id: userId
                },
                category: {
                    id: categoryId
                }
            }
        })
   }

   async save(transaction: Transaction): Promise<Transaction> {
        return await this.transactionRepository.save(transaction)
   }
}
