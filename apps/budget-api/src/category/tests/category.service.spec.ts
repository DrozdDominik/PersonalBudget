import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../category.service';
import { describe, beforeEach, it, expect, vi } from 'vitest'
import { CategoryController } from "../category.controller";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Category } from "../category.entity";
import { Repository } from "typeorm";
import { CategoryCreateDto } from "../dtos/category-create.dto";
import { faker } from "@faker-js/faker";
import { CategoryCreateData, CategoryId } from "../types";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { User } from "../../user/user.entity";
import { UserId, UserRole } from "../../user/types";
import { CustomCategoryIdentificationData } from "../../types";
import { TransactionService } from "../../transaction/transaction.service";
import { Transaction } from "../../transaction/transaction.entity";
import { transactionFactory } from "../../transaction/tests/utils";
import { TransactionType } from "../../transaction/types";
import { CategoryEditDto } from "../dtos/category-edit.dto";
import { BudgetService } from "../../budget/budget.service";
import { UserService } from "../../user/user.service";
import { Budget } from "../../budget/budget.entity";

describe('CategoryService', () => {
  let service: CategoryService;
  let repo: Repository<Category>
  let transactionService: TransactionService;
  let transactionRepo: Repository<Transaction>
  let budgetService: BudgetService
  let budgetRepo: Repository<Budget>
  let userService: UserService
  let userRepo: Repository<User>


  const testData: CategoryCreateDto = {
    name: faker.word.noun(),
    transactionType: TransactionType.INCOME
  }

  const firstDefaultCategory: Category = {
    id: faker.string.uuid() as CategoryId,
    name: faker.word.noun(),
    isDefault: true,
    transactionType: TransactionType.INCOME,
    user: null,
    transactions: []
  }

  const secondDefaultCategory: Category = {
    id: faker.string.uuid() as CategoryId,
    name: faker.word.noun(),
    isDefault: true,
    transactionType: TransactionType.INCOME,
    user: null,
    transactions: []
  }

  const firstUser = {
    id: faker.string.uuid() as UserId,
    name: faker.internet.userName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    currentToken: null,
    role: UserRole.User,
    transactions: [],
    categories: [],
    ownBudgets: [],
  } as User

  const firstCategory: Category = {
    id: faker.string.uuid() as CategoryId,
    name: faker.word.noun(),
    isDefault: false,
    transactionType: TransactionType.INCOME,
    user: firstUser,
    transactions: []
  }

  const secondCategory: Category = {
    id: faker.string.uuid() as CategoryId,
    name: faker.word.noun(),
    isDefault: false,
    transactionType: TransactionType.INCOME,
    user: firstUser,
    transactions: []
  }

  const testCategoryIdentificationData: CustomCategoryIdentificationData = {
    categoryId: firstCategory.id,
    userId: firstUser.id,
  }

  const categoryEditedData: CategoryEditDto = {
    name: faker.word.noun()
  }

  const editedCategory = {
    ...firstCategory,
    name: categoryEditedData.name,
  }

  const editedDefaultCategory = {
    ...firstDefaultCategory,
    name: categoryEditedData.name,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
          CategoryService,
          TransactionService,
          BudgetService,
          UserService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
            findOne: vi.fn(),
            delete: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
            findOne: vi.fn(),
            delete: vi.fn(),
            find: vi.fn(),
          }
        },
        {
          provide: getRepositoryToken(Budget),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
            findOne: vi.fn(),
            delete: vi.fn(),
            find: vi.fn(),
          }
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
            findOne: vi.fn(),
            delete: vi.fn(),
            find: vi.fn(),
          }
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);

    repo = module.get<Repository<Category>>(getRepositoryToken(Category))

    transactionService = module.get<TransactionService>(TransactionService);

    transactionRepo = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));

    budgetService = module.get<BudgetService>(BudgetService)

    budgetRepo = module.get<Repository<Budget>>(getRepositoryToken(Budget))

    userService = module.get<UserService>(UserService)

    userRepo = module.get<Repository<User>>(getRepositoryToken(User))
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create default method', () => {
    const dataToSave: CategoryCreateData = {
      name: testData.name,
      transactionType: TransactionType.INCOME,
      isDefault: true,
      user: null
    }

    const savedCategory: Category = {
      ...dataToSave,
      id: faker.string.uuid() as CategoryId,
      transactions: [],
    }

    it('should call categoryRepository.create method with correct data', async () => {
      vi.spyOn(service, 'findDefaultByNameAndTransactionType').mockResolvedValueOnce(null)
      vi.spyOn(repo, 'save').mockResolvedValueOnce(savedCategory)
      vi.spyOn(service, 'getAllCustomByNameAndTransactionType').mockResolvedValueOnce([])

      await service.createDefault(testData)

      expect(repo.create).toHaveBeenCalledWith(dataToSave)
    })

    it('should throw error if category already exists', async () => {
      vi.spyOn(service, 'findDefaultByNameAndTransactionType').mockResolvedValueOnce(firstDefaultCategory)

      await expect(service.createDefault(testData)).rejects.toThrowError(BadRequestException)
    })

    it('should call this.delete method with correct data', async () => {
      vi.spyOn(service, 'findDefaultByNameAndTransactionType').mockResolvedValueOnce(null)
      vi.spyOn(repo, 'save').mockResolvedValueOnce(savedCategory)
      vi.spyOn(service, 'getAllCustomByNameAndTransactionType').mockResolvedValueOnce([firstCategory])
      vi.spyOn(transactionService, 'getAllByCategory').mockResolvedValueOnce([])
      vi.spyOn(service, 'delete').mockResolvedValueOnce(true)

      await service.createDefault(testData)

      expect(service.delete).toHaveBeenCalledOnce()
      expect(service.delete).toHaveBeenCalledWith(firstCategory.id, firstCategory.user.id)
    })

    it('should call this.delete method the same number as the number of custom categories found', async () => {
      vi.spyOn(service, 'findDefaultByNameAndTransactionType').mockResolvedValueOnce(null)
      vi.spyOn(repo, 'save').mockResolvedValueOnce(savedCategory)
      vi.spyOn(service, 'getAllCustomByNameAndTransactionType').mockResolvedValueOnce([firstCategory, secondCategory])
      vi.spyOn(transactionService, 'getAllByCategory').mockResolvedValue([])
      vi.spyOn(service, 'delete').mockResolvedValue(true)

      await service.createDefault(testData)

      expect(service.delete).toHaveBeenCalledTimes(2)
    })

    it('should call transactionService.save method with transaction with correct edited category id', async () => {
      const transactionsArr = transactionFactory(2, TransactionType.INCOME, firstCategory.user.id)

      vi.spyOn(service, 'findDefaultByNameAndTransactionType').mockResolvedValueOnce(null)
      vi.spyOn(repo, 'save').mockResolvedValueOnce(savedCategory)
      vi.spyOn(service, 'getAllCustomByNameAndTransactionType').mockResolvedValueOnce([firstCategory])
      vi.spyOn(transactionService, 'getAllByCategory').mockResolvedValueOnce(transactionsArr)
      vi.spyOn(service, 'delete').mockResolvedValueOnce(true)
      vi.spyOn(transactionService, 'save')

      const lastTransaction = transactionsArr.at(-1)
      lastTransaction.category.id = savedCategory.id

      await service.createDefault(testData)

      expect(transactionService.save).toHaveBeenCalledTimes(2)
      expect(transactionService.save).toHaveBeenLastCalledWith(lastTransaction)
    })
  })

  describe('Create method', () => {
    it('should call categoryRepository.create method with correct data', async () => {
      vi.spyOn(service, 'findDefaultByNameAndTransactionType').mockResolvedValueOnce(null)
      vi.spyOn(service, 'findCustomByUserAndNameAndTransactionType').mockResolvedValueOnce(null)

      const dataToSave: CategoryCreateData = {
        name: testData.name,
        isDefault: false,
        transactionType: TransactionType.INCOME,
        user: firstUser
      }

      await service.create(testData, firstUser)

      expect(repo.create).toHaveBeenCalledWith(dataToSave)
    })

    it('should throw error if same default category already exists', async () => {
      vi.spyOn(service, 'findDefaultByNameAndTransactionType').mockResolvedValueOnce(firstDefaultCategory)

      await expect(service.create(testData, firstUser)).rejects.toThrowError(BadRequestException)
    })

    it('should throw error if same user category already exists', async () => {
      vi.spyOn(service, 'findDefaultByNameAndTransactionType').mockResolvedValueOnce(null)
      vi.spyOn(service, 'findCustomByUserAndNameAndTransactionType').mockResolvedValueOnce(firstCategory)

      await expect(service.create(testData, firstUser)).rejects.toThrowError(BadRequestException)
    })
  })

  describe('Delete method', () => {
    it('should call categoryRepository.delete method with correct category id', async () => {
      vi.spyOn(service, 'findCustomById').mockResolvedValue(firstCategory)
      vi.spyOn(repo, 'delete').mockResolvedValueOnce({raw: [], affected: 1})

      await service.delete(firstCategory.id, firstUser.id)

      expect(repo.delete).toHaveBeenCalledWith(firstCategory.id)
    })

    it('should throw error if there is no such category', async () => {
      vi.spyOn(service, 'findCustomById').mockResolvedValueOnce(null)

      await expect(service.delete(firstCategory.id, firstUser.id)).rejects.toThrowError(NotFoundException)
    })
  })

  describe('Delete default method', () => {
    it('should call categoryRepository.delete method with correct category id', async () => {
      vi.spyOn(service, 'findDefaultById').mockResolvedValue(firstDefaultCategory)
      vi.spyOn(repo, 'delete').mockResolvedValueOnce({raw: [], affected: 1})

      await service.deleteDefault(firstDefaultCategory.id)

      expect(repo.delete).toHaveBeenCalledWith(firstDefaultCategory.id)
    })

    it('should throw error if there is no such category', async () => {
      vi.spyOn(service, 'findDefaultById').mockResolvedValueOnce(null)

      await expect(service.deleteDefault(firstDefaultCategory.id)).rejects.toThrowError(NotFoundException)
    })
  })

  describe('Edit method', () => {
    it('should call categoryRepository.save method correctly edited name', async () => {
      vi.spyOn(service, 'findCustomById').mockResolvedValueOnce(firstCategory)
      vi.spyOn(service, 'findCustomByUserAndNameAndTransactionType').mockResolvedValueOnce(null)

      await service.edit(testCategoryIdentificationData, categoryEditedData)

      expect(repo.save).toHaveBeenCalledWith(editedCategory)
    })

    it('should throw error if there is no such category', async () => {
      vi.spyOn(service, 'findCustomById').mockResolvedValueOnce(null)

      await expect(service.edit(testCategoryIdentificationData, categoryEditedData)).rejects.toThrowError(NotFoundException)
    })

    it('should throw error if this user category with same name already exists', async () => {
      vi.spyOn(service, 'findCustomById').mockResolvedValueOnce(firstCategory)
      vi.spyOn(service, 'findCustomByUserAndNameAndTransactionType').mockResolvedValueOnce(secondCategory)

      await expect(service.edit(testCategoryIdentificationData, categoryEditedData)).rejects.toThrowError(BadRequestException)
    })
  })

  describe('Edit default method', () => {
    it('should call categoryRepository.save method correctly edited name', async () => {
      vi.spyOn(service, 'findDefaultById').mockResolvedValueOnce(firstDefaultCategory)
      vi.spyOn(service, 'findDefaultByNameAndTransactionType').mockResolvedValueOnce(null)

      await service.editDefault(firstDefaultCategory.id, categoryEditedData)

      expect(repo.save).toHaveBeenCalledWith(editedDefaultCategory)
    })

    it('should throw error if there is no such default category', async () => {
      vi.spyOn(service, 'findDefaultById').mockResolvedValueOnce(null)

      await expect(service.editDefault(firstDefaultCategory.id, categoryEditedData)).rejects.toThrowError(NotFoundException)
    })

    it('should throw error if default category with same name already exists', async () => {
      vi.spyOn(service, 'findDefaultById').mockResolvedValueOnce(firstDefaultCategory)
      vi.spyOn(service, 'findDefaultByNameAndTransactionType').mockResolvedValueOnce(secondDefaultCategory)

      await expect(service.editDefault(firstDefaultCategory.id, categoryEditedData)).rejects.toThrowError(BadRequestException)
    })
  })
});
