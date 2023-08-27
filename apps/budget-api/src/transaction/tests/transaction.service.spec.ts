import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../transaction.service';
import { describe, beforeEach, it, expect, vi } from 'vitest'
import { Repository } from "typeorm";
import { Transaction } from "../transaction.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreateTransactionDto } from "../dtos/create-transaction.dto";
import { faker } from "@faker-js/faker";
import { User } from "../../user/user.entity";
import { UserId, UserIdentificationData, UserRole } from "../../user/types";
import { TransactionIdentificationData } from "../../types";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { transactionFactory } from "./utils";
import { Category } from "../../category/category.entity";
import { CategoryService } from "../../category/category.service";
import { CategoryId } from "../../category/types";
import { TransactionType } from "../types";

describe('TransactionService', () => {
  let service: TransactionService;
  let repo: Repository<Transaction>
  let categoryService: CategoryService
  let categoryRepo: Repository<Category>

  const firstUser: User = {
    id: faker.string.uuid() as UserId,
    name: faker.internet.userName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    currentToken: null,
    role: UserRole.User,
    transactions: [],
    categories: [],
  }

  const admin: User = {
    id: faker.string.uuid() as UserId,
    name: faker.internet.userName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    currentToken: null,
    role: UserRole.Admin,
    transactions: [],
    categories: [],
  }

  const [firstUserTransaction] = transactionFactory(1, TransactionType.INCOME, firstUser.id)

  const editedData: Partial<CreateTransactionDto> = {
    categoryId: faker.string.uuid() as CategoryId,
    amount: Number(faker.finance.amount(0, 1000000, 2))
  }

  const editedCategory: Category = {
    id: faker.string.uuid() as CategoryId,
    name: faker.word.noun(),
    isDefault: false,
    user: firstUser,
    transactions: [],
  }

  const firstUserIdentificationData: UserIdentificationData = {
    id: firstUser.id,
    role: firstUser.role
  }

  const secondUserIdentificationData: UserIdentificationData = {
    id: faker.string.uuid() as UserId,
    role: UserRole.User,
  }

  const adminIdentificationData: UserIdentificationData = {
    id: admin.id,
    role: admin.role
  }

  const firstTransactionIdentificationData: TransactionIdentificationData = {
    transactionId: firstUserTransaction.id,
    user: firstUserIdentificationData
  }

  const secondTransactionIdentificationData: TransactionIdentificationData = {
    transactionId: firstUserTransaction.id,
    user: secondUserIdentificationData
  }

  const adminTransactionIdentificationData: TransactionIdentificationData = {
    transactionId: firstUserTransaction.id,
    user: adminIdentificationData
  }

  const editedTransaction: Transaction = {
    ...firstUserTransaction,
    category: editedCategory,
    amount: editedData.amount
  }

  const category: Category = {
    id: faker.string.uuid() as CategoryId,
    name: faker.word.noun(),
    isDefault: false,
    user: firstUser,
    transactions: [],
  }

  const transactionData: CreateTransactionDto = {
    type: TransactionType.INCOME,
    categoryId: faker.string.uuid() as CategoryId,
    amount: Number(faker.finance.amount(0, 1000000, 2)),
    date: faker.date.anytime({refDate: '18-06-2023'}),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
          TransactionService,
          CategoryService,
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
          provide: getRepositoryToken(Category),
          useValue: {
            findOne: vi.fn(),
          }
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);

    repo = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));

    categoryService = module.get<CategoryService>(CategoryService)

    categoryRepo = module.get<Repository<Category>>(getRepositoryToken(Category))
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Edit method', () => {
    it('should call transactionRepository.save method with correctly edited data', async () => {
      vi.spyOn(service, 'getOne').mockResolvedValueOnce(firstUserTransaction)
      vi.spyOn(categoryService, 'findDefaultOrCustomByUserAndId').mockResolvedValueOnce(editedCategory)

      await service.edit(firstTransactionIdentificationData, editedData)

      expect(repo.save).toHaveBeenCalledWith(editedTransaction)
    })

    it('should throw error if transaction not exists', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(null)

      await expect( service.edit(firstTransactionIdentificationData, editedData) ).rejects.toThrowError(NotFoundException)
    })

    it('should throw error if edited category not exists', async () => {
      vi.spyOn(service, 'getOne').mockResolvedValueOnce(firstUserTransaction)
      vi.spyOn(categoryService, 'findDefaultOrCustomByUserAndId').mockResolvedValueOnce(null)

      await expect( service.edit(firstTransactionIdentificationData, editedData) ).rejects.toThrowError(BadRequestException)
    })

    it('should throw error if transaction belongs to another user', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(firstUserTransaction)

      await expect( service.edit(secondTransactionIdentificationData, editedData) ).rejects.toThrowError(ForbiddenException)
    })

    it('should not throw error if admin edit transaction belongs to another user', async () => {
      vi.spyOn(service, 'getOne').mockResolvedValueOnce(firstUserTransaction)
      vi.spyOn(categoryService, 'findDefaultOrCustomByUserAndId').mockResolvedValueOnce(editedCategory)

      await service.edit(adminTransactionIdentificationData, editedData)

      expect(adminTransactionIdentificationData.user.role).toEqual(UserRole.Admin)
      expect(firstUserTransaction.user.id).not.toEqual(adminTransactionIdentificationData.user.id)
      expect(repo.save).toHaveBeenCalledWith(editedTransaction)
    })
  })

  describe('Create method', () => {
    it('should call transactionRepository.save method with correct data', async () => {
      const createdTransaction: Transaction = {
        category,
        type: TransactionType.INCOME,
        amount: transactionData.amount,
        date: transactionData.date,
        comment: undefined,
        id: undefined,
        user: undefined
      }

      const transactionToSave = {
        ...createdTransaction,
        user: firstUser,
      }

      vi.spyOn(repo, 'create').mockReturnValueOnce(createdTransaction)
      vi.spyOn(categoryService, 'findDefaultOrCustomByUserAndId').mockResolvedValueOnce(category)

      await service.create(transactionData, firstUser)

      expect(repo.save).toHaveBeenCalledWith(transactionToSave)
    })

    it('should throw error if category not exists', async () => {
      vi.spyOn(categoryService, 'findDefaultOrCustomByUserAndId').mockResolvedValueOnce(null)

      await expect(service.create(transactionData, firstUser)).rejects.toThrowError(BadRequestException)
    })
  })

  describe('Delete method', () => {
    it('should call transactionRepository.delete method with correct transaction id', async () => {
      vi.spyOn(service, 'getOne').mockResolvedValueOnce(firstUserTransaction)
      vi.spyOn(repo, 'delete').mockResolvedValueOnce({raw: [], affected: 1})

      await service.delete(firstUserTransaction.id, firstUserIdentificationData)

      expect(repo.delete).toHaveBeenCalledWith(firstUserTransaction.id)
    })

    it('should throw error if transaction not exists', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(null)

      await expect( service.delete(firstUserTransaction.id, firstUserIdentificationData) ).rejects.toThrowError(NotFoundException)
    })

    it('should throw error if transaction belongs to another user', async () => {
      const secondUserId = faker.string.uuid() as UserId
      const [ secondUserTransaction ] = transactionFactory(1, TransactionType.INCOME, secondUserId)

      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(secondUserTransaction)

      await expect( service.delete(secondUserTransaction.id, firstUserIdentificationData) ).rejects.toThrowError(ForbiddenException)
    })

    it('should not throw error if admin delete transaction belongs to another user', async () => {
      vi.spyOn(service, 'getOne').mockResolvedValueOnce(firstUserTransaction)
      vi.spyOn(repo, 'delete').mockResolvedValueOnce({raw: [], affected: 1})

      await service.delete(firstUserTransaction.id, adminIdentificationData)

      expect(adminIdentificationData.role).toEqual(UserRole.Admin)
      expect(firstUserTransaction.user.id).not.toEqual(adminIdentificationData.id)
      expect(repo.delete).toHaveBeenCalledWith(firstUserTransaction.id)
    })
  })

  describe('Get one method', () => {
    it('should return transaction if provided correct data', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(firstUserTransaction)
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValueOnce(category)

     const transaction = await service.getOne(firstUserTransaction.id, firstUserIdentificationData)

      expect(transaction).toEqual(firstUserTransaction)
    })

    it('should throw error if transaction not exists', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(null)

      await expect( service.getOne(firstUserTransaction.id, firstUserIdentificationData) ).rejects.toThrowError(NotFoundException)
    })

    it('should throw error if transaction belongs to another user', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(firstUserTransaction)

      await expect( service.getOne(firstUserTransaction.id, secondUserIdentificationData) ).rejects.toThrowError(ForbiddenException)
    })

    it('should not throw error if admin get transaction belongs to another user', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(firstUserTransaction)

      const transaction = await service.getOne(firstUserTransaction.id, adminIdentificationData)

      expect(adminIdentificationData.role).toEqual(UserRole.Admin)
      expect(firstUserTransaction.user.id).not.toEqual(adminIdentificationData.id)
      expect(transaction).toEqual(firstUserTransaction)
    })
  })

  describe('Get all method', () => {
    it('should call transactionRepository.find method with correct options when user is not admin', async () => {
      const optionsForUser = {
        relations: {
          user: true,
          category: true,
        },
        where: {
          user: {
            id: firstUser.id
          }
        }
      }

      await service.getAll(firstUserIdentificationData)

      expect(repo.find).toHaveBeenCalledWith(optionsForUser)
    })

    it('should call transactionRepository.find method with correct options when user is admin', async () => {
      const optionsForAdmin = {
        relations: {
          user: true,
          category: true,
        }
      }

      await service.getAll(adminIdentificationData)

      expect(repo.find).toHaveBeenCalledWith(optionsForAdmin)
    })
  })
});
