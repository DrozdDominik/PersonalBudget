import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthService } from "../auth.service";
import { User } from "../../user/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { vi } from "vitest";
import { Repository } from "typeorm";

describe('AuthService', () => {
    let service: AuthService;
    let repo: Repository<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        create: vi.fn(),
                        save: vi.fn(),
                        findOne: vi.fn()
                    }
                },
            ],
        }).compile();

        service = module.get(AuthService);

        repo = module.get<Repository<User>>(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
