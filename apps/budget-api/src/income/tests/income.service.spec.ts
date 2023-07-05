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

describe('IncomeService', () => {
  let service: IncomeService;
  let repo: Repository<Income>

  const testUser: User = {
    id: faker.string.uuid(),
    name: faker.internet.userName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    currentToken: null,
    role: UserRole.User,
    incomes: [],
  }

  const testAdmin: User = {
    id: faker.string.uuid(),
    name: faker.internet.userName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    currentToken: null,
    role: UserRole.Admin,
    incomes: [],
  }

  const testIncome: Income = {
    id: faker.string.uuid(),
    name: faker.word.noun(),
    amount: Number(faker.finance.amount(0, 1000000, 2)),
    date: faker.date.anytime({refDate: '18-06-2023'}),
    user: testUser,
  }

  const editedData: Partial<CreateIncomeDto> = {
    name: faker.word.noun(),
    amount: Number(faker.finance.amount(0, 1000000, 2))
  }

  const testUserIdentificationData: UserIdentificationData = {
    id: testUser.id,
    role: testUser.role
  }

  const testSecondUserIdentificationData: UserIdentificationData = {
    id: faker.string.uuid(),
    role: UserRole.User,
  }

  const testAdminIdentificationData: UserIdentificationData = {
    id: testAdmin.id,
    role: testAdmin.role
  }

  const testIdentificationData: TransactionIdentificationData = {
    transactionId: testIncome.id,
    user: testUserIdentificationData
  }

  const testSecondIdentificationData: TransactionIdentificationData = {
    transactionId: testIncome.id,
    user: testSecondUserIdentificationData
  }

  const adminTestIdentificationData: TransactionIdentificationData = {
    transactionId: testIncome.id,
    user: testAdminIdentificationData
  }

  const testEditedIncome: Income = {
    ...testIncome,
    ...editedData
  }

  const testIncomeData: CreateIncomeDto = {
    name: faker.word.noun(),
    amount: Number(faker.finance.amount(0, 1000000, 2)),
    date: faker.date.anytime({refDate: '18-06-2023'}),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
          IncomeService,
        {
          provide: getRepositoryToken(Income),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
            findOne: vi.fn(),
            delete: vi.fn(),
          }
        },
      ],
    }).compile();

    service = module.get<IncomeService>(IncomeService);

    repo = module.get<Repository<Income>>(getRepositoryToken(Income));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Edit method', () => {
    it('should call incomeRepository.save method with correctly edited data', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(testIncome)

      await service.edit(testIdentificationData, editedData)

      expect(repo.save).toHaveBeenCalledWith(testEditedIncome)
    })

    it('should throw error if income not exists', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(null)

      await expect( service.edit(testIdentificationData, editedData) ).rejects.toThrowError(NotFoundException)
    })

    it('should throw error if income belongs to another user', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(testIncome)

      await expect( service.edit(testSecondIdentificationData, editedData) ).rejects.toThrowError(ForbiddenException)
    })

    it('should not throw error if admin edit income belongs to another user', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(testIncome)

      await service.edit(adminTestIdentificationData, editedData)

      expect(adminTestIdentificationData.user.role).toEqual(UserRole.Admin)
      expect(testIncome.user.id).not.toEqual(adminTestIdentificationData.user.id)
      expect(repo.save).toHaveBeenCalledWith(testEditedIncome)
    })
  })

  describe('Create method', () => {
    it('should call incomeRepository.save method with correct data', async () => {
      const createdIncome: Income = {
        ...testIncomeData,
        id: undefined,
        user: undefined
      }

      const incomeToSave = {
        ...createdIncome,
        user: testUser,
      }

      vi.spyOn(repo, 'create').mockReturnValueOnce(createdIncome)

      await service.create(testIncomeData, testUser)

      expect(repo.save).toHaveBeenCalledWith(incomeToSave)
    })
  })

  describe('Delete method', () => {
    it('should call incomeRepository.delete method with correct income id', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(testIncome)
      vi.spyOn(repo, 'delete').mockResolvedValueOnce({raw: [], affected: 1})

      await service.delete(testIncome.id, testUserIdentificationData)

      expect(repo.delete).toHaveBeenCalledWith(testIncome.id)
    })

    it('should throw error if income not exists', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(null)

      await expect( service.delete(testIncome.id, testUserIdentificationData) ).rejects.toThrowError(NotFoundException)
    })

    it('should throw error if income belongs to another user', async () => {
      testIncome.user.id = faker.string.uuid()

      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(testIncome)

      await expect( service.delete(testIncome.id, testUserIdentificationData) ).rejects.toThrowError(ForbiddenException)
    })

    it('should not throw error if admin delete income belongs to another user', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(testIncome)
      vi.spyOn(repo, 'delete').mockResolvedValueOnce({raw: [], affected: 1})

      await service.delete(testIncome.id, testAdminIdentificationData)

      expect(testAdminIdentificationData.role).toEqual(UserRole.Admin)
      expect(testIncome.user.id).not.toEqual(testAdminIdentificationData.id)
      expect(repo.delete).toHaveBeenCalledWith(testIncome.id)
    })
  })
});
