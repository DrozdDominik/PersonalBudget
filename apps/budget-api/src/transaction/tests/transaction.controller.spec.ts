import { Test, TestingModule } from '@nestjs/testing'
import { TransactionController } from '../transaction.controller'
import { beforeEach, describe, expect, it } from 'vitest'
import { TransactionService } from '../transaction.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Transaction } from '../transaction.entity'
import { Repository } from 'typeorm'
import { CategoryService } from '../../category/category.service'
import { Category } from '../../category/category.entity'
import { BudgetService } from '../../budget/budget.service'
import { UserService } from '../../user/user.service'
import { Budget } from '../../budget/budget.entity'
import { User } from '../../user/user.entity'

describe('TransactionController', () => {
  let controller: TransactionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        TransactionService,
        CategoryService,
        BudgetService,
        UserService,
        {
          provide: getRepositoryToken(Transaction),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Budget),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile()

    controller = module.get<TransactionController>(TransactionController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
