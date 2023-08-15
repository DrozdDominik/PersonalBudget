import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../category.service';
import { describe, beforeEach, it, expect, vi } from 'vitest'
import { CategoryController } from "../category.controller";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Category } from "../category.entity";
import { Repository } from "typeorm";
import { CategoryNameDto } from "../dtos/category-name.dto";
import { faker } from "@faker-js/faker";
import { CategoryCreateData, CategoryId } from "../types";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { User} from "../../user/user.entity";
import { UserId, UserRole } from "../../user/types";
import { CustomCategoryIdentificationData } from "../../types";
import { IncomeService } from "../../income/income.service";
import { Income } from "../../income/income.entity";
import { incomeFactory } from "../../income/tests/utils";

describe('CategoryService', () => {
  let service: CategoryService;
  let repo: Repository<Category>
  let incomeService: IncomeService;
  let incomeRepo: Repository<Income>

  const testData: CategoryNameDto = {
    name: faker.word.noun()
  }

  const firstDefaultCategory: Category = {
    id: faker.string.uuid() as CategoryId,
    name: faker.word.noun(),
    isDefault: true,
    user: null,
    incomes: []
  }

  const secondDefaultCategory: Category = {
    id: faker.string.uuid() as CategoryId,
    name: faker.word.noun(),
    isDefault: true,
    user: null,
    incomes: []
  }

  const firstUser: User = {
    id: faker.string.uuid() as UserId,
    name: faker.internet.userName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    currentToken: null,
    role: UserRole.User,
    incomes: [],
    categories: [],
  }

  const firstCategory: Category = {
    id: faker.string.uuid() as CategoryId,
    name: faker.word.noun(),
    isDefault: false,
    user: firstUser,
    incomes: []
  }

  const secondCategory: Category = {
    id: faker.string.uuid() as CategoryId,
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

  const editedDefaultCategory = {
    ...firstDefaultCategory,
    name: newCategoryName,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
          CategoryService,
          IncomeService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
            findOne: vi.fn(),
            delete: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(Income),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
            findOne: vi.fn(),
            delete: vi.fn(),
            find: vi.fn(),
          }
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);

    repo = module.get<Repository<Category>>(getRepositoryToken(Category))

    incomeService = module.get<IncomeService>(IncomeService);

    incomeRepo = module.get<Repository<Income>>(getRepositoryToken(Income));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create default method', () => {
    const dataToSave: CategoryCreateData = {
      name: testData.name,
      isDefault: true,
      user: null
    }

    const savedCategory: Category = {
      ...dataToSave,
      id: faker.string.uuid() as CategoryId,
      incomes: [],
    }

    it('should call categoryRepository.create method with correct data', async () => {
      vi.spyOn(service, 'findDefaultByName').mockResolvedValueOnce(null)
      vi.spyOn(repo, 'save').mockResolvedValueOnce(savedCategory)
      vi.spyOn(service, 'getAllCustomByName').mockResolvedValueOnce([])

      await service.createDefault(testData)

      expect(repo.create).toHaveBeenCalledWith(dataToSave)
    })

    it('should throw error if category already exists', async () => {
      vi.spyOn(service, 'findDefaultByName').mockResolvedValueOnce(firstDefaultCategory)

      await expect(service.createDefault(testData)).rejects.toThrowError(BadRequestException)
    })

    it('should call this.delete method with correct data', async () => {
      vi.spyOn(service, 'findDefaultByName').mockResolvedValueOnce(null)
      vi.spyOn(repo, 'save').mockResolvedValueOnce(savedCategory)
      vi.spyOn(service, 'getAllCustomByName').mockResolvedValueOnce([firstCategory])
      vi.spyOn(incomeService, 'getAllByCategory').mockResolvedValueOnce([])
      vi.spyOn(service, 'delete').mockResolvedValueOnce(true)

      await service.createDefault(testData)

      expect(service.delete).toHaveBeenCalledOnce()
      expect(service.delete).toHaveBeenCalledWith(firstCategory.id, firstCategory.user.id)
    })

    it('should call this.delete method the same number as the number of custom categories found', async () => {
      vi.spyOn(service, 'findDefaultByName').mockResolvedValueOnce(null)
      vi.spyOn(repo, 'save').mockResolvedValueOnce(savedCategory)
      vi.spyOn(service, 'getAllCustomByName').mockResolvedValueOnce([firstCategory, secondCategory])
      vi.spyOn(incomeService, 'getAllByCategory').mockResolvedValue([])
      vi.spyOn(service, 'delete').mockResolvedValue(true)

      await service.createDefault(testData)

      expect(service.delete).toHaveBeenCalledTimes(2)
    })

    it('should call incomeService.save method with income with correct edited category id', async () => {
      const incomesArr = incomeFactory(2, firstCategory.user.id)

      vi.spyOn(service, 'findDefaultByName').mockResolvedValueOnce(null)
      vi.spyOn(repo, 'save').mockResolvedValueOnce(savedCategory)
      vi.spyOn(service, 'getAllCustomByName').mockResolvedValueOnce([firstCategory])
      vi.spyOn(incomeService, 'getAllByCategory').mockResolvedValueOnce(incomesArr)
      vi.spyOn(service, 'delete').mockResolvedValueOnce(true)
      vi.spyOn(incomeService, 'save')

      const lastIncome = incomesArr.at(-1)
      lastIncome.category.id = savedCategory.id

      await service.createDefault(testData)

      expect(incomeService.save).toHaveBeenCalledTimes(2)
      expect(incomeService.save).toHaveBeenLastCalledWith(lastIncome)
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
      vi.spyOn(service, 'findDefaultByName').mockResolvedValueOnce(firstDefaultCategory)

      await expect(service.create(testData, firstUser)).rejects.toThrowError(BadRequestException)
    })

    it('should throw error if same user category already exists', async () => {
      vi.spyOn(service, 'findDefaultByName').mockResolvedValueOnce(null)
      vi.spyOn(service, 'findCustomByUserAndName').mockResolvedValueOnce(firstCategory)

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
      vi.spyOn(service, 'findDefaultById').mockResolvedValue(firstDefaultCategory)
      vi.spyOn(repo, 'delete').mockResolvedValueOnce({raw: [], affected: 1})

      await service.deleteDefault(firstDefaultCategory.id)

      expect(repo.delete).toHaveBeenCalledWith(firstDefaultCategory.id)
    })

    it('should throw error if there is no such category', async () => {
      vi.spyOn(service, 'findDefaultById').mockResolvedValueOnce(null)

      await expect(service.deleteDefault(firstDefaultCategory.id)).rejects.toThrowError(NotFoundException)
    })
  })

  describe('Edit method', () => {
    it('should call categoryRepository.save method correctly edited name', async () => {
      vi.spyOn(service, 'findCustomById').mockResolvedValueOnce(firstCategory)
      vi.spyOn(service, 'findCustomByUserAndName').mockResolvedValueOnce(null)

      await service.edit(testCategoryIdentificationData, newCategoryName)

      expect(repo.save).toHaveBeenCalledWith(editedCategory)
    })

    it('should throw error if there is no such category', async () => {
      vi.spyOn(service, 'findCustomById').mockResolvedValueOnce(null)

      await expect(service.edit(testCategoryIdentificationData, newCategoryName)).rejects.toThrowError(NotFoundException)
    })

    it('should throw error if this user category with same name already exists', async () => {
      vi.spyOn(service, 'findCustomById').mockResolvedValueOnce(firstCategory)
      vi.spyOn(service, 'findCustomByUserAndName').mockResolvedValueOnce(secondCategory)

      await expect(service.edit(testCategoryIdentificationData, newCategoryName)).rejects.toThrowError(BadRequestException)
    })
  })

  describe('Edit default method', () => {
    it('should call categoryRepository.save method correctly edited name', async () => {
      vi.spyOn(service, 'findDefaultById').mockResolvedValueOnce(firstDefaultCategory)
      vi.spyOn(service, 'findDefaultByName').mockResolvedValueOnce(null)

      await service.editDefault(firstDefaultCategory.id, newCategoryName)

      expect(repo.save).toHaveBeenCalledWith(editedDefaultCategory)
    })

    it('should throw error if there is no such default category', async () => {
      vi.spyOn(service, 'findDefaultById').mockResolvedValueOnce(null)

      await expect(service.editDefault(firstDefaultCategory.id, newCategoryName)).rejects.toThrowError(NotFoundException)
    })

    it('should throw error if default category with same name already exists', async () => {
      vi.spyOn(service, 'findDefaultById').mockResolvedValueOnce(firstDefaultCategory)
      vi.spyOn(service, 'findDefaultByName').mockResolvedValueOnce(secondDefaultCategory)

      await expect(service.editDefault(firstDefaultCategory.id, newCategoryName)).rejects.toThrowError(BadRequestException)
    })
  })
});
