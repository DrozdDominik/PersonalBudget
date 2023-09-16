import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Category } from './category.entity'
import { Repository } from 'typeorm'
import { CategoryCreateDto } from './dtos/category-create.dto'
import { CategoryCreateData, CategoryId } from './types'
import { User } from '../user/user.entity'
import { CustomCategoryIdentificationData } from '../types'
import { TransactionService } from '../transaction/transaction.service'
import { UserId } from '../user/types'
import { TransactionType } from '../transaction/types'
import { CategoryEditDto } from './dtos/category-edit.dto'

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @Inject(forwardRef(() => TransactionService)) private transactionService: TransactionService,
  ) {}

  async findDefaultByNameAndTransactionType(
    name: string,
    transactionType: TransactionType,
  ): Promise<Category | null> {
    return await this.categoryRepository.findOne({
      where: {
        name: name.toLowerCase(),
        isDefault: true,
        transactionType,
      },
    })
  }

  async findCustomByUserAndNameAndTransactionType(
    name: string,
    transactionType: TransactionType,
    userId: UserId,
  ): Promise<Category | null> {
    return await this.categoryRepository.findOne({
      where: {
        name: name.toLowerCase(),
        transactionType,
        user: {
          id: userId,
        },
      },
    })
  }

  async findCustomById(id: CategoryId, userId: UserId) {
    return await this.categoryRepository.findOne({
      relations: {
        transactions: true,
        user: true,
      },
      where: {
        id,
        isDefault: false,
        user: {
          id: userId,
        },
      },
    })
  }

  async findDefaultOrCustomByUserAndId(id: CategoryId, userId: UserId): Promise<Category> {
    const defaultCategory = await this.findDefaultById(id)

    if (defaultCategory) {
      return defaultCategory
    }

    const category = await this.findCustomById(id, userId)

    if (!category) {
      throw new NotFoundException()
    }

    return category
  }

  async findDefaultById(id: CategoryId) {
    return await this.categoryRepository.findOne({
      relations: { transactions: true },
      where: {
        id,
        isDefault: true,
        user: null,
      },
    })
  }

  async createDefault(data: CategoryCreateDto) {
    const defaultCategory = await this.findDefaultByNameAndTransactionType(
      data.name,
      data.transactionType,
    )

    if (defaultCategory) {
      throw new BadRequestException()
    }

    const newCategoryData: CategoryCreateData = {
      name: data.name.toLowerCase(),
      isDefault: true,
      transactionType: data.transactionType,
      user: null,
    }

    const newDefaultCategory = this.categoryRepository.create(newCategoryData)
    const savedNewDefaultCategory = await this.categoryRepository.save(newDefaultCategory)

    const customCategories = await this.getAllCustomByNameAndTransactionType(
      savedNewDefaultCategory.name,
      savedNewDefaultCategory.transactionType,
    )

    if (customCategories.length > 0) {
      customCategories.map(async category => {
        const transactions = await this.transactionService.getAllByCategory(
          category.id,
          category.user.id,
        )
        await Promise.all(
          transactions.map(transaction => {
            transaction.category.id = savedNewDefaultCategory.id
            return this.transactionService.save(transaction)
          }),
        )
      })

      const deleteResult = await Promise.all(
        customCategories.map(async category => {
          return this.delete(category.id, category.user.id)
        }),
      )

      const isAllDeleted = deleteResult.filter(result => !result).length === 0

      if (!isAllDeleted) {
        throw new Error('Deleting categories went wrong...')
      }
    }

    return savedNewDefaultCategory
  }

  async create(data: CategoryCreateDto, user: User) {
    const defaultCategory = await this.findDefaultByNameAndTransactionType(
      data.name,
      data.transactionType,
    )

    if (defaultCategory) {
      throw new BadRequestException()
    }

    const category = await this.findCustomByUserAndNameAndTransactionType(
      data.name,
      data.transactionType,
      user.id,
    )

    if (category) {
      throw new BadRequestException()
    }

    const newCategoryData: CategoryCreateData = {
      name: data.name.toLowerCase(),
      isDefault: false,
      transactionType: data.transactionType,
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

  async edit(identificationData: CustomCategoryIdentificationData, dataToEdit: CategoryEditDto) {
    const { categoryId, userId } = identificationData

    const category = await this.findCustomById(categoryId, userId)

    if (!category) {
      throw new NotFoundException()
    }

    const transactionType = dataToEdit.transactionType ?? category.transactionType

    const name = dataToEdit.name ?? category.name

    const exitsUserCategory = await this.findCustomByUserAndNameAndTransactionType(
      name,
      transactionType,
      userId,
    )

    if (exitsUserCategory) {
      throw new BadRequestException(`User ${transactionType} category ${name} already exits`)
    }

    category.name = name
    category.transactionType = transactionType

    return await this.categoryRepository.save(category)
  }

  async editDefault(id: CategoryId, dataToEdit: CategoryEditDto) {
    const defaultCategory = await this.findDefaultById(id)

    if (!defaultCategory) {
      throw new NotFoundException()
    }

    const transactionType = dataToEdit.transactionType ?? defaultCategory.transactionType

    const name = dataToEdit.name ?? defaultCategory.name

    const exitsDefaultCategory = await this.findDefaultByNameAndTransactionType(
      name,
      transactionType,
    )

    if (exitsDefaultCategory) {
      throw new BadRequestException(`Default ${transactionType} category ${name} already exits`)
    }

    defaultCategory.name = name
    defaultCategory.transactionType = transactionType

    return await this.categoryRepository.save(defaultCategory)
  }

  async getAllForTransactionType(
    userId: UserId,
    transactionType: TransactionType,
  ): Promise<Category[]> {
    return await this.categoryRepository.find({
      relations: {
        user: true,
      },
      where: {
        user: {
          id: userId,
        },
        transactionType,
      },
    })
  }

  async getAllDefaultForTransactionType(transactionType: TransactionType): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: {
        isDefault: true,
        transactionType,
      },
    })
  }

  async getAllAvailableForTransactionType(
    userId: UserId,
    transactionType: TransactionType,
  ): Promise<Category[]> {
    return await this.categoryRepository.find({
      relations: { user: true },
      where: [
        {
          isDefault: true,
          transactionType,
        },
        {
          user: {
            id: userId,
          },
          transactionType,
        },
      ],
    })
  }

  async getAllCustomByNameAndTransactionType(
    name: string,
    transactionType: TransactionType,
  ): Promise<Category[]> {
    return await this.categoryRepository.find({
      relations: { user: true },
      where: {
        name,
        isDefault: false,
        transactionType,
      },
    })
  }
}
