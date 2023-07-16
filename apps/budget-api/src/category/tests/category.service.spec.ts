import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../category.service';
import { describe, beforeEach, it, expect } from 'vitest'
import { CategoryController } from "../category.controller";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Category } from "../category.entity";
import { Repository } from "typeorm";

describe('CategoryService', () => {
  let service: CategoryService;
  let repo: Repository<Category>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
          CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: {

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
});
