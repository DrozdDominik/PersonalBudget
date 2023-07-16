import { Test, TestingModule } from '@nestjs/testing';
import { IncomeController } from '../income.controller';
import { describe, beforeEach, it, expect } from 'vitest'
import { IncomeService } from "../income.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Income } from "../income.entity";
import { Repository } from "typeorm";
import { CategoryService } from "../../category/category.service";
import { Category } from "../../category/category.entity";

describe('IncomeController', () => {
  let controller: IncomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncomeController],
      providers: [
          IncomeService,
          CategoryService,
        {
          provide: getRepositoryToken(Income),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
      ]
    }).compile();

    controller = module.get<IncomeController>(IncomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
