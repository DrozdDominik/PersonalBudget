import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../category.controller';
import { describe, beforeEach, it, expect } from 'vitest'
import { CategoryService } from "../category.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Category } from "../category.entity";
import { Repository } from "typeorm";
import { Transaction } from "../../transaction/transaction.entity";
import { TransactionService } from "../../transaction/transaction.service";
import { BudgetService } from "../../budget/budget.service";
import { UserService } from "../../user/user.service";
import { Budget } from "../../budget/budget.entity";
import { User } from "../../user/user.entity";

describe('CategoryController', () => {
  let controller: CategoryController;

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
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Transaction),
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
    }).compile();

    controller = module.get<CategoryController>(CategoryController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
