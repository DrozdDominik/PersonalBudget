import { Test, TestingModule } from '@nestjs/testing'
import { BudgetController } from '../budget.controller'
import { beforeEach, describe, expect, it } from 'vitest'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Budget } from '../budget.entity'
import { BudgetService } from '../budget.service'
import { UserService } from '../../user/user.service'
import { User } from '../../user/user.entity'

describe('BudgetController', () => {
  let controller: BudgetController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetController],
      providers: [
        BudgetService,
        UserService,
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

    controller = module.get<BudgetController>(BudgetController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
