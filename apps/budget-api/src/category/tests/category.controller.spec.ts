import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../category.controller';
import { describe, beforeEach, it, expect } from 'vitest'
import { CategoryService } from "../category.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Category } from "../category.entity";
import { Repository } from "typeorm";
import { Income } from "../../income/income.entity";
import { IncomeService } from "../../income/income.service";

describe('CategoryController', () => {
  let controller: CategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        CategoryService,
        IncomeService,
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Income),
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
