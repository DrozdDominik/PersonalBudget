import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { NewUserData, UserId, UserIdentificationData, UserRole } from './types'
import { InjectRepository } from '@nestjs/typeorm'
import { RegisterUserDto } from './dtos/register-user.dto'
import { hashPassword } from '../utils'
import { EditUserDto } from './dtos/edit-user.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(newUserData: NewUserData): Promise<User> {
    const user = this.usersRepository.create(newUserData)

    return this.usersRepository.save(user)
  }

  async findOneById(id: UserId) {
    return this.usersRepository.findOne({ where: { id } })
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } })
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find()
  }

  async register(data: RegisterUserDto) {
    const user = await this.findOneByEmail(data.email)

    if (!!user) {
      throw new BadRequestException('email is use')
    }

    const passwordHash = await hashPassword(data.password)

    const newUserData: NewUserData = {
      name: data.name,
      email: data.email,
      passwordHash,
    }

    return await this.create(newUserData)
  }

  async edit(id: UserId, userData: UserIdentificationData, editedData: EditUserDto) {
    const user = await this.findOneById(id)

    if (!user) {
      throw new NotFoundException()
    }

    if (user.id !== userData.id && userData.role !== UserRole.Admin) {
      throw new ForbiddenException()
    }

    if (!!editedData.email) {
      const user = await this.findOneByEmail(editedData.email)

      if (!!user) {
        throw new BadRequestException('email is use')
      }
    }

    let passwordHash: string | null = null

    if (!!editedData.password) {
      passwordHash = await hashPassword(editedData.password)
    }

    const { password, ...data } = editedData

    const editedDataToSave = passwordHash
      ? {
          passwordHash,
          ...data,
        }
      : editedData

    Object.assign(user, editedDataToSave)

    return this.usersRepository.save(user)
  }

  async delete(id: UserId, userData: UserIdentificationData): Promise<void> {
    const user = await this.findOneById(id)

    if (!user) {
      throw new NotFoundException()
    }

    if (user.id !== userData.id && userData.role !== UserRole.Admin) {
      throw new ForbiddenException()
    }

    try {
      await this.usersRepository.delete(user.id)
    } catch {
      throw new Error('Delete operation failed')
    }
  }

  async get(id: UserId, userData: UserIdentificationData) {
    const user = await this.findOneById(id)

    if (!user) {
      throw new NotFoundException()
    }

    if (user.id !== userData.id && userData.role !== UserRole.Admin) {
      throw new ForbiddenException()
    }

    return user
  }
}