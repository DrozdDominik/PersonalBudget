import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../category.service';
import {describe, beforeEach, it, expect, vi} from 'vitest'
import { CategoryController } from "../category.controller";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Category } from "../category.entity";
import { Repository } from "typeorm";
import {CreateCategoryDto} from "../dtos/create-category.dto";
import {faker} from "@faker-js/faker";
import {CategoryCreateData} from "../types";
import {BadRequestException} from "@nestjs/common";

describe('CategoryService', () => {
  let service: CategoryService;
  let repo: Repository<Category>

  const testData: CreateCategoryDto = {
    name: faker.word.noun()
  }

  const testDefaultCategory: Category = {
    id: faker.string.uuid(),
    name: faker.word.noun(),
    isDefault: true,
    user: null,
    incomes: []
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
          CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
            findOne: vi.fn(),
          },
        }
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);

    repo = module.get<Repository<Category>>(getRepositoryToken(Category))
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create default method', () => {
    it('should call categoryRepository.create method with correct data', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(null)

      const dataToSave: CategoryCreateData = {
        name: testData.name,
        isDefault: true,
        user: null
      }

      await service.createDefault(testData)

      expect(repo.create).toHaveBeenCalledWith(dataToSave)
    })

    it('should throw error if category already exists', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(testDefaultCategory)

      await expect(service.createDefault(testData)).rejects.toThrowError(BadRequestException)
    })
  })
});
