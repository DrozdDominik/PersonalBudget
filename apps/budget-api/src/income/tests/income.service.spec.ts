import { Test, TestingModule } from '@nestjs/testing';
import { IncomeService } from '../income.service';
import { describe, beforeEach, it, expect, vi } from 'vitest'
import { Repository } from "typeorm";
import { Income } from "../income.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreateIncomeDto } from "../dtos/create-income.dto";
import { faker } from "@faker-js/faker";
import { User } from "../../user/user.entity";
import { UserRole } from "../../user/types";
import { TransactionIds } from "../../types";
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

  const testIds: TransactionIds = {
    userId: testUser.id,
    transactionId: testIncome.id,
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
            findOne: vi.fn()
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

      await service.edit(testIds, editedData)

      expect(repo.save).toHaveBeenCalledWith(testEditedIncome)
    })

    it('should throw error if income not exists', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(null)

      await expect( service.edit(testIds, editedData) ).rejects.toThrowError(NotFoundException)
    })

    it('should throw error if income belongs to another user', async () => {
      testIncome.user.id = faker.string.uuid()

      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(testIncome)

      await expect( service.edit(testIds, editedData) ).rejects.toThrowError(ForbiddenException)
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
});
