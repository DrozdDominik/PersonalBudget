import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest'
import { faker } from '@faker-js/faker';
import { AuthService } from "../services/auth.service";
import { UsersService } from "../services/users.service";
import { User } from "../user.entity";
import { RegisterUserDto } from "../dtos/register-user.dto";
import { BadRequestException } from "@nestjs/common";
import { NewUserData, UserRole } from "../types";

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    const user: Partial<User>= {
        id: faker.string.uuid(),
        name: faker.internet.userName(),
        email: faker.internet.email(),
    };

    beforeEach(async () => {
        fakeUsersService = {
            findOneByEmail: (email: string) => {
                return email === user.email ? Promise.resolve(user) : Promise.resolve(null);
            },
            create: (newUserData: NewUserData):Promise<User> => {
                const id = faker.string.uuid()
                const newUser = {
                    id,
                    role: UserRole.User,
                    ...newUserData
                }
                return Promise.resolve(newUser)
            }
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUsersService,
                },
            ],
        }).compile();

        service = module.get(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Register method', () => {

        const invalidData: RegisterUserDto = {
            name: faker.internet.userName(),
            email: user.email,
            password: faker.internet.password()
        }

        const validData: RegisterUserDto = {
            name: faker.internet.userName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }

        it('should throw BadRequestException if email already used', async () => {
            await expect( service.register(invalidData) ).rejects.toThrowError(BadRequestException)
        })

        it('should creates a new user with a salted and hashed password', async () =>{
            const user = await service.register(validData)
            const [hash, salt] = user.passwordHash.split('.')

            expect(user.passwordHash).not.toEqual(validData.password)
            expect(hash).toBeDefined()
            expect(hash).toHaveLength(64)
            expect(salt).toBeDefined()
            expect(salt).toHaveLength(16)
        })
    })
});
