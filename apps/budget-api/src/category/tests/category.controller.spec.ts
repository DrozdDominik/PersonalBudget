import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../category.controller';
import { describe, beforeEach, it, expect } from 'vitest'
import { CategoryService } from "../category.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Category } from "../category.entity";
import { Repository } from "typeorm";
import { Transaction } from "../../transaction/transaction.entity";
import { TransactionService } from "../../transaction/transaction.service";

describe('CategoryController', () => {
  let controller: CategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        CategoryService,
        TransactionService,
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Transaction),
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
