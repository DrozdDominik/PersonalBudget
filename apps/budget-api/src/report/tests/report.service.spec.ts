import { Test, TestingModule } from '@nestjs/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ReportService } from '../report.service'
import { BudgetService } from '../../budget/budget.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Budget } from '../../budget/budget.entity'
import { Repository } from 'typeorm'
import { ReportController } from '../report.controller'
import { UserService } from '../../user/user.service'
import { User } from '../../user/user.entity'

describe('BalanceService', () => {
  let service: ReportService
  let budgetService: BudgetService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [
        ReportService,
        UserService,
        {
          provide: BudgetService,
          useValue: {
            findBudgetWithTransactionsAndCategoriesByIdAndUserId: vi.fn(),
            findBudgetWithTransactionsAndCategoriesByIdAndUserIdInDateRange: vi.fn(),
            getAllUserBudgetsWithTransactionsAndCategories: vi.fn(),
            getAllBudgetsWithTransactionsAndCategoriesInDateRange: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Budget),
          useClass: Repository,
        },
      ],
    }).compile()

    service = module.get<ReportService>(ReportService)

    budgetService = module.get<BudgetService>(BudgetService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
