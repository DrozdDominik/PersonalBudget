import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../category.controller';
import { describe, beforeEach, it, expect } from 'vitest'
import { CategoryService } from "../category.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Category } from "../category.entity";
import { Repository } from "typeorm";

describe('CategoryController', () => {
  let controller: CategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        }
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
