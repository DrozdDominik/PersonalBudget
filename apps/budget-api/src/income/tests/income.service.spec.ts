import { Test, TestingModule } from '@nestjs/testing';
import { IncomeService } from '../income.service';
import { describe, beforeEach, it, expect, vi } from 'vitest'
import { Repository } from "typeorm";
import { Income } from "../income.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreateIncomeDto } from "../dtos/create-income.dto";
import { faker } from "@faker-js/faker";
import { User } from "../../user/user.entity";
import { UserIdentificationData, UserRole } from "../../user/types";
import { TransactionIdentificationData } from "../../types";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { incomeFactory } from "./utils";
import { Category } from "../../category/category.entity";
import { CategoryService } from "../../category/category.service";

describe('IncomeService', () => {
  let service: IncomeService;
  let repo: Repository<Income>
  let categoryService: CategoryService
  let categoryRepo: Repository<Category>

  const firstUser: User = {
    id: faker.string.uuid(),
    name: faker.internet.userName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    currentToken: null,
    role: UserRole.User,
    incomes: [],
    categories: [],
  }

  const admin: User = {
    id: faker.string.uuid(),
    name: faker.internet.userName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    currentToken: null,
    role: UserRole.Admin,
    incomes: [],
    categories: [],
  }

  const [firstUserIncome] = incomeFactory(1, firstUser.id)

  const editedData: Partial<CreateIncomeDto> = {
    categoryName: faker.word.noun(),
    amount: Number(faker.finance.amount(0, 1000000, 2))
  }

  const firstUserIdentificationData: UserIdentificationData = {
    id: firstUser.id,
    role: firstUser.role
  }

  const secondUserIdentificationData: UserIdentificationData = {
    id: faker.string.uuid(),
    role: UserRole.User,
  }

  const adminIdentificationData: UserIdentificationData = {
    id: admin.id,
    role: admin.role
  }

  const firstIncomeIdentificationData: TransactionIdentificationData = {
    transactionId: firstUserIncome.id,
    user: firstUserIdentificationData
  }

  const secondIncomeIdentificationData: TransactionIdentificationData = {
    transactionId: firstUserIncome.id,
    user: secondUserIdentificationData
  }

  const adminIncomeIdentificationData: TransactionIdentificationData = {
    transactionId: firstUserIncome.id,
    user: adminIdentificationData
  }

  const editedIncome: Income = {
    ...firstUserIncome,
    ...editedData
  }

  const category: Category = {
    id: faker.string.uuid(),
    name: faker.word.noun(),
    isDefault: false,
    user: firstUser,
    incomes: [],
  }

  const incomeData: CreateIncomeDto = {
    categoryName: faker.word.noun(),
    amount: Number(faker.finance.amount(0, 1000000, 2)),
    date: faker.date.anytime({refDate: '18-06-2023'}),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
          IncomeService,
          CategoryService,
        {
          provide: getRepositoryToken(Income),
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

    service = module.get<IncomeService>(IncomeService);

    repo = module.get<Repository<Income>>(getRepositoryToken(Income));

    categoryService = module.get<CategoryService>(CategoryService)

    categoryRepo = module.get<Repository<Category>>(getRepositoryToken(Category))
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Edit method', () => {
    it('should call incomeRepository.save method with correctly edited data', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(firstUserIncome)

      await service.edit(firstIncomeIdentificationData, editedData)

      expect(repo.save).toHaveBeenCalledWith(editedIncome)
    })

    it('should throw error if income not exists', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(null)

      await expect( service.edit(firstIncomeIdentificationData, editedData) ).rejects.toThrowError(NotFoundException)
    })

    it('should throw error if income belongs to another user', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(firstUserIncome)

      await expect( service.edit(secondIncomeIdentificationData, editedData) ).rejects.toThrowError(ForbiddenException)
    })

    it('should not throw error if admin edit income belongs to another user', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(firstUserIncome)

      await service.edit(adminIncomeIdentificationData, editedData)

      expect(adminIncomeIdentificationData.user.role).toEqual(UserRole.Admin)
      expect(firstUserIncome.user.id).not.toEqual(adminIncomeIdentificationData.user.id)
      expect(repo.save).toHaveBeenCalledWith(editedIncome)
    })
  })

  describe('Create method', () => {
    it('should call incomeRepository.save method with correct data', async () => {
      const createdIncome: Income = {
        category,
        amount: incomeData.amount,
        date: incomeData.date,
        id: undefined,
        user: undefined
      }

      const incomeToSave = {
        ...createdIncome,
        user: firstUser,
      }

      vi.spyOn(repo, 'create').mockReturnValueOnce(createdIncome)
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValueOnce(category)

      await service.create(incomeData, firstUser)

      expect(repo.save).toHaveBeenCalledWith(incomeToSave)
    })
  })

  describe('Delete method', () => {
    it('should call incomeRepository.delete method with correct income id', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(firstUserIncome)
      vi.spyOn(repo, 'delete').mockResolvedValueOnce({raw: [], affected: 1})

      await service.delete(firstUserIncome.id, firstUserIdentificationData)

      expect(repo.delete).toHaveBeenCalledWith(firstUserIncome.id)
    })

    it('should throw error if income not exists', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(null)

      await expect( service.delete(firstUserIncome.id, firstUserIdentificationData) ).rejects.toThrowError(NotFoundException)
    })

    it('should throw error if income belongs to another user', async () => {
      const secondUserId = faker.string.uuid()
      const [ secondUserIncome ] = incomeFactory(1, secondUserId)

      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(secondUserIncome)

      await expect( service.delete(secondUserIncome.id, firstUserIdentificationData) ).rejects.toThrowError(ForbiddenException)
    })

    it('should not throw error if admin delete income belongs to another user', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(firstUserIncome)
      vi.spyOn(repo, 'delete').mockResolvedValueOnce({raw: [], affected: 1})

      await service.delete(firstUserIncome.id, adminIdentificationData)

      expect(adminIdentificationData.role).toEqual(UserRole.Admin)
      expect(firstUserIncome.user.id).not.toEqual(adminIdentificationData.id)
      expect(repo.delete).toHaveBeenCalledWith(firstUserIncome.id)
    })
  })

  describe('Get one method', () => {
    it('should return income if provided correct data', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(firstUserIncome)
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValueOnce(category)

     const income = await service.getOne(firstUserIncome.id, firstUserIdentificationData)

      expect(income).toEqual(firstUserIncome)
    })

    it('should throw error if income not exists', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(null)

      await expect( service.getOne(firstUserIncome.id, firstUserIdentificationData) ).rejects.toThrowError(NotFoundException)
    })

    it('should throw error if income belongs to another user', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(firstUserIncome)

      await expect( service.getOne(firstUserIncome.id, secondUserIdentificationData) ).rejects.toThrowError(ForbiddenException)
    })

    it('should not throw error if admin get income belongs to another user', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(firstUserIncome)

      const income = await service.getOne(firstUserIncome.id, adminIdentificationData)

      expect(adminIdentificationData.role).toEqual(UserRole.Admin)
      expect(firstUserIncome.user.id).not.toEqual(adminIdentificationData.id)
      expect(income).toEqual(firstUserIncome)
    })
  })

  describe('Get all method', () => {
    it('should call incomeRepository.find method with correct options when user is not admin', async () => {
      const optionsForUser = {
        relations: {user: true},
        where: {
          user: {
            id: firstUser.id
          }
        }
      }

      await service.getAll(firstUserIdentificationData)

      expect(repo.find).toHaveBeenCalledWith(optionsForUser)
    })

    it('should call incomeRepository.find method with correct options when user is admin', async () => {
      const optionsForAdmin = {
        relations: {user: true}
      }

      await service.getAll(adminIdentificationData)

      expect(repo.find).toHaveBeenCalledWith(optionsForAdmin)
    })
  })
});
