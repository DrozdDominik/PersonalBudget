import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from '../transaction.controller';
import { describe, beforeEach, it, expect } from 'vitest'
import { TransactionService } from "../transaction.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Transaction } from "../transaction.entity";
import { Repository } from "typeorm";
import { CategoryService } from "../../category/category.service";
import { Category } from "../../category/category.entity";

describe('TransactionController', () => {
  let controller: TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
          TransactionService,
          CategoryService,
        {
          provide: getRepositoryToken(Transaction),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
      ]
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
