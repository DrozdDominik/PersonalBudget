import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../category.service';
import {describe, beforeEach, it, expect, vi} from 'vitest'
import { CategoryController } from "../category.controller";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Category } from "../category.entity";
import { Repository } from "typeorm";
import { CategoryNameDto } from "../dtos/category-name.dto";
import { faker } from "@faker-js/faker";
import { CategoryCreateData } from "../types";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { User} from "../../user/user.entity";
import { UserRole } from "../../user/types";
import { CustomCategoryIdentificationData } from "../../types";

describe('CategoryService', () => {
  let service: CategoryService;
  let repo: Repository<Category>

  const testData: CategoryNameDto = {
    name: faker.word.noun()
  }

  const testDefaultCategory: Category = {
    id: faker.string.uuid(),
    name: faker.word.noun(),
    isDefault: true,
    user: null,
    incomes: []
  }

  const firstUser: User = {
    id: faker.string.uuid(),
    name: faker.internet.userName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    currentToken: null,
    role: UserRole.User,
    incomes: [],
    categories: [],
  }

  const firstCategory: Category = {
    id: faker.string.uuid(),
    name: faker.word.noun(),
    isDefault: false,
    user: firstUser,
    incomes: []
  }

  const testCategoryIdentificationData: CustomCategoryIdentificationData = {
    categoryId: firstCategory.id,
    userId: firstUser.id
  }

  const newCategoryName = faker.word.noun()

  const editedCategory = {
    ...firstCategory,
    name: newCategoryName,
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
            delete: vi.fn(),
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
      vi.spyOn(service, 'findDefaultByName').mockResolvedValueOnce(null)

      const dataToSave: CategoryCreateData = {
        name: testData.name,
        isDefault: true,
        user: null
      }

      await service.createDefault(testData)

      expect(repo.create).toHaveBeenCalledWith(dataToSave)
    })

    it('should throw error if category already exists', async () => {
      vi.spyOn(service, 'findDefaultByName').mockResolvedValueOnce(testDefaultCategory)

      await expect(service.createDefault(testData)).rejects.toThrowError(BadRequestException)
    })
  })

  describe('Create method', () => {
    it('should call categoryRepository.create method with correct data', async () => {
      vi.spyOn(service, 'findDefaultByName').mockResolvedValueOnce(null)
      vi.spyOn(service, 'findCustomByUserAndName').mockResolvedValueOnce(null)

      const dataToSave: CategoryCreateData = {
        name: testData.name,
        isDefault: false,
        user: firstUser
      }

      await service.create(testData, firstUser)

      expect(repo.create).toHaveBeenCalledWith(dataToSave)
    })

    it('should throw error if same default category already exists', async () => {
      vi.spyOn(service, 'findDefaultByName').mockResolvedValueOnce(testDefaultCategory)

      await expect(service.create(testData, firstUser)).rejects.toThrowError(BadRequestException)
    })
  })

  describe('Delete method', () => {
    it('should call categoryRepository.delete method with correct category id', async () => {
      vi.spyOn(service, 'findCustomById').mockResolvedValue(firstCategory)
      vi.spyOn(repo, 'delete').mockResolvedValueOnce({raw: [], affected: 1})

      await service.delete(firstCategory.id, firstUser.id)

      expect(repo.delete).toHaveBeenCalledWith(firstCategory.id)
    })

    it('should throw error if there is no such category', async () => {
      vi.spyOn(service, 'findCustomById').mockResolvedValueOnce(null)

      await expect(service.delete(firstCategory.id, firstUser.id)).rejects.toThrowError(NotFoundException)
    })
  })

  describe('Delete default method', () => {
    it('should call categoryRepository.delete method with correct category id', async () => {
      vi.spyOn(service, 'findDefaultById').mockResolvedValue(testDefaultCategory)
      vi.spyOn(repo, 'delete').mockResolvedValueOnce({raw: [], affected: 1})

      await service.deleteDefault(testDefaultCategory.id)

      expect(repo.delete).toHaveBeenCalledWith(testDefaultCategory.id)
    })

    it('should throw error if there is no such category', async () => {
      vi.spyOn(service, 'findDefaultById').mockResolvedValueOnce(null)

      await expect(service.deleteDefault(testDefaultCategory.id)).rejects.toThrowError(NotFoundException)
    })
  })

  describe('Edit method', () => {
    it('should call categoryRepository.save method correctly edited name', async () => {
      vi.spyOn(service, 'findCustomById').mockResolvedValueOnce(firstCategory)

      await service.edit(testCategoryIdentificationData, newCategoryName)

      expect(repo.save).toHaveBeenCalledWith(editedCategory)
    })

    it('should throw error if there is no such category', async () => {
      vi.spyOn(service, 'findCustomById').mockResolvedValueOnce(null)

      await expect(service.edit(testCategoryIdentificationData, newCategoryName)).rejects.toThrowError(NotFoundException)
    })
  })
});
