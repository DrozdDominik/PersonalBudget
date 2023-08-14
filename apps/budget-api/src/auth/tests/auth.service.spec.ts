import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthService } from "../auth.service";
import { User } from "../../user/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { vi } from "vitest";
import { Repository } from "typeorm";
import { AuthLoginDto } from "../dtos/auth-login.dto";
import { faker } from "@faker-js/faker";
import { Response } from 'express'
import { BadRequestException } from "@nestjs/common";
import { UserRole } from "../../user/types";
import * as utils from "../../utils";
import * as jwt from "../jwt/token"

describe('AuthService', () => {
    let service: AuthService;
    let repo: Repository<User>;

    const responseMock = {
        clearCookie: vi.fn(() => responseMock),
        cookie: vi.fn(() => responseMock),
        json: vi.fn()
    } as unknown as Response

    const incorrectCredentials: AuthLoginDto = {
        email: faker.internet.email(),
        password: faker.internet.password()
    }

    const correctCredentials = incorrectCredentials

    const testUser: User = {
        id: faker.string.uuid(),
        name: faker.internet.userName(),
        email: faker.internet.email(),
        passwordHash: faker.internet.password(),
        currentToken: null,
        role: UserRole.User,
        incomes: [],
        categories: [],
    };

    const jwtData = {
        accessToken: faker.string.uuid(),
        expiresIn: faker.number.int()
    }

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

    describe('Login method', () => {
        it('should throw error if provided incorrect credentials', async () => {
            vi.spyOn(repo, 'findOne').mockResolvedValueOnce(null)

            await expect( service.login(incorrectCredentials, responseMock)).rejects.toThrowError(BadRequestException)
        })

        it('should login user', async () => {
            vi.spyOn(repo, 'findOne').mockResolvedValueOnce(testUser)
            vi.spyOn(utils, 'verifyPassword').mockResolvedValueOnce(true)
            vi.spyOn(jwt, 'createJwtToken').mockResolvedValue(jwtData)

            await service.login(correctCredentials, responseMock)

            expect(responseMock.json).toHaveBeenCalledWith({ok: true})
        })
    })

    describe('Logout method', () => {
        it('should logout user', async () => {

            await service.logout(testUser, responseMock)

            expect(responseMock.json).toHaveBeenCalledWith({ok: true})
        })
    })
});
