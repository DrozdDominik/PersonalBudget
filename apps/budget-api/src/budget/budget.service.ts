import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Budget } from './budget.entity'
import { Brackets, Repository } from 'typeorm'
import { User } from '../user/user.entity'
import { UserId } from '../user/types'
import { BudgetId, BudgetWithUsers, SearchOptions } from './types'
import { UserService } from '../user/user.service'
import { deleteUserFromBudgetUsers, isUserAmongBudgetUsers } from './utils'
import { DateRange } from '../types'
import { Transaction } from '../transaction/transaction.entity'

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    @Inject(UserService) private userService: UserService,
  ) {}

  async findBudgetByOwnerAndName(name: string, ownerId: UserId): Promise<Budget | null> {
    return await this.budgetRepository.findOne({
      where: {
        name,
        owner: {
          id: ownerId,
        },
      },
    })
  }

  async findBudgetById(id: BudgetId): Promise<Budget | null> {
    return await this.budgetRepository.findOne({
      relations: {
        owner: true,
        users: true,
        transactions: true,
      },
      where: {
        id,
      },
    })
  }

  async findBudgetByIdAndOwner(id: BudgetId, ownerId: UserId): Promise<Budget | null> {
    return await this.budgetRepository.findOne({
      where: {
        id,
        owner: {
          id: ownerId,
        },
      },
    })
  }

  async getBudgetTransactions(
    id: BudgetId,
    userId: UserId,
    dateRange: DateRange,
  ): Promise<Transaction[] | null> {
    const query = this.budgetRepository
      .createQueryBuilder('budget')
      .leftJoinAndSelect('budget.users', 'user')
      .leftJoinAndSelect('budget.transactions', 'transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.user', 'transactionUser')
      .where('budget.id = :id', { id })
      .andWhere(
        new Brackets(qb => {
          qb.where('budget.owner.id = :userId', { userId }).orWhere('user.id = :userId', { userId })
        }),
      )

    let budget: Budget

    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start)
      start.setHours(0, 0, 0, 0)

      const end = new Date(dateRange.end)
      end.setHours(23, 59, 59, 999)

      budget = await query
        .andWhere('transaction.date BETWEEN :start AND :end', { start, end })
        .getOne()
    } else {
      budget = await query.getOne()
    }

    return budget ? budget.transactions : null
  }

  async getBudgetIfUserHasAccess(id: BudgetId, userId: UserId): Promise<Budget | null> {
    return await this.budgetRepository
      .createQueryBuilder('budget')
      .leftJoinAndSelect('budget.users', 'user')
      .where('budget.id = :id', { id })
      .andWhere(
        new Brackets(qb => {
          qb.where('budget.owner.id = :userId', { userId }).orWhere('user.id = :userId', { userId })
        }),
      )
      .getOne()
  }

  async create(name: string, owner: User): Promise<Budget> {
    const newBudgetName = name.trim().toLowerCase()
    const existBudget = await this.findBudgetByOwnerAndName(newBudgetName, owner.id)

    if (existBudget) {
      throw new BadRequestException()
    }

    const budget = this.budgetRepository.create({
      name: newBudgetName,
      owner,
    })

    return this.budgetRepository.save(budget)
  }

  async getBudget(budgetId: BudgetId, userId?: UserId): Promise<BudgetWithUsers> {
    const budget = userId
      ? await this.budgetRepository
          .createQueryBuilder('budget')
          .leftJoinAndSelect('budget.owner', 'owner')
          .leftJoinAndSelect('budget.users', 'user')
          .leftJoinAndSelect('budget.transactions', 'transactions')
          .where('budget.id = :id', { id: budgetId })
          .andWhere(
            new Brackets(qb => {
              qb.where('owner.id = :userId', { userId }).orWhere('user.id = :userId', {
                userId,
              })
            }),
          )
          .getOne()
      : await this.findBudgetById(budgetId)

    if (!budget) {
      throw new NotFoundException()
    }

    const users = await budget.users

    return {
      ...budget,
      users,
    }
  }

  async addUser(budgetId: BudgetId, ownerId: UserId, newUserId: UserId): Promise<BudgetWithUsers> {
    const budget = await this.findBudgetByIdAndOwner(budgetId, ownerId)

    if (!budget) {
      throw new NotFoundException('Budget not found')
    }

    if (ownerId === newUserId) {
      throw new BadRequestException('Cannot share budget with yourself')
    }

    const newUser = await this.userService.findOneById(newUserId)

    if (!newUser) {
      throw new NotFoundException('User not found')
    }

    const budgetUsers = await budget.users

    if (isUserAmongBudgetUsers(newUserId, budgetUsers)) {
      throw new BadRequestException('Already has access')
    }

    budgetUsers.push(newUser)

    budget.users = Promise.resolve(budgetUsers)

    try {
      await this.budgetRepository.save(budget)
    } catch (e) {
      throw new Error(e)
    }

    return {
      ...budget,
      users: budgetUsers,
    }
  }

  async getAllOwnBudgets(ownerId: UserId): Promise<BudgetWithUsers[]> {
    const budgets = await this.budgetRepository.find({
      relations: {
        owner: true,
        users: true,
        transactions: true,
      },
      where: {
        owner: {
          id: ownerId,
        },
      },
    })

    return await Promise.all(
      budgets.map(async budget => {
        const users = await budget.users
        return {
          ...budget,
          users,
        }
      }),
    )
  }

  async getAllSharedBudgets(userId: UserId): Promise<BudgetWithUsers[]> {
    const budgets = await this.budgetRepository
      .createQueryBuilder('budget')
      .leftJoinAndSelect('budget.owner', 'owner')
      .leftJoinAndSelect('budget.users', 'user')
      .leftJoinAndSelect('budget.transactions', 'transactions')
      .where('owner.id != :userId', { userId })
      .andWhere('user.id = :userId', { userId })
      .getMany()

    for (const budget of budgets) {
      budget.users = this.budgetRepository
        .createQueryBuilder('budget')
        .relation(Budget, 'users')
        .of(budget)
        .loadMany()
    }

    return await Promise.all(
      budgets.map(async budget => {
        const users = await budget.users
        return {
          ...budget,
          users,
        }
      }),
    )
  }

  async getAllUserBudgets(userId: UserId): Promise<BudgetWithUsers[]> {
    const budgets = await this.budgetRepository
      .createQueryBuilder('budget')
      .leftJoinAndSelect('budget.owner', 'owner')
      .leftJoinAndSelect('budget.users', 'user')
      .leftJoinAndSelect('budget.transactions', 'transactions')
      .where('owner.id = :userId', { userId })
      .orWhere('user.id = :userId', { userId })
      .getMany()

    for (const budget of budgets) {
      budget.users = this.budgetRepository
        .createQueryBuilder('budget')
        .relation(Budget, 'users')
        .of(budget)
        .loadMany()
    }

    return await Promise.all(
      budgets.map(async budget => {
        const users = await budget.users
        return {
          ...budget,
          users,
        }
      }),
    )
  }

  async getAllBudgetsWithTransactions(
    userId: UserId,
    dateRange: DateRange,
  ): Promise<BudgetWithUsers[]> {
    let budgets: Budget[]

    const query = this.budgetRepository
      .createQueryBuilder('budget')
      .leftJoinAndSelect('budget.users', 'user')
      .leftJoinAndSelect('budget.transactions', 'transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.user', 'transactionUser')
      .andWhere(
        new Brackets(qb => {
          qb.where('budget.owner.id = :userId', { userId }).orWhere('user.id = :userId', { userId })
        }),
      )

    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start)
      start.setHours(0, 0, 0, 0)

      const end = new Date(dateRange.end)
      end.setHours(23, 59, 59, 999)

      budgets = await query
        .where('transaction.date BETWEEN :start AND :end', { start, end })
        .getMany()
    } else {
      budgets = await query.getMany()
    }

    return await Promise.all(
      budgets.map(async budget => {
        const users = await budget.users
        return {
          ...budget,
          users,
        }
      }),
    )
  }

  async editName(id: BudgetId, ownerId: UserId, newName: string): Promise<Budget> {
    const budgetWithSameName = await this.findBudgetByOwnerAndName(newName, ownerId)

    if (!!budgetWithSameName) {
      throw new BadRequestException('There is already budget with this name')
    }

    const budget = await this.findBudgetById(id)

    if (!budget) {
      throw new NotFoundException('Budget not found')
    }

    budget.name = newName

    return await this.budgetRepository.save(budget)
  }

  async removeUser(budgetId: BudgetId, ownerId: UserId, userId: UserId): Promise<BudgetWithUsers> {
    const budget = await this.findBudgetByIdAndOwner(budgetId, ownerId)

    if (!budget) {
      throw new NotFoundException('There is no budget')
    }

    const users = await budget.users

    if (!isUserAmongBudgetUsers(userId, users)) {
      throw new NotFoundException('There is no such budget user')
    }

    const filteredUsers = deleteUserFromBudgetUsers(userId, users)

    budget.users = Promise.resolve(filteredUsers)

    try {
      await this.budgetRepository.save(budget)
    } catch (e) {
      throw new Error(e)
    }

    return {
      ...budget,
      users: filteredUsers,
    }
  }

  async delete(budgetId: BudgetId, ownerId?: UserId): Promise<void> {
    const budget = ownerId
      ? await this.findBudgetByIdAndOwner(budgetId, ownerId)
      : await this.findBudgetById(budgetId)

    if (!budget) {
      throw new NotFoundException()
    }

    try {
      await this.budgetRepository.delete(budgetId)
    } catch {
      throw new Error(`Delete budget ${budget.id} failed`)
    }
  }

  async getBudgetTransactionsBySearchOptions(
    budgetId: BudgetId,
    userId: UserId,
    options: SearchOptions,
  ): Promise<Transaction[] | null> {
    let start: Date | undefined
    let end: Date | undefined

    if (options.dateRange) {
      start = new Date(options.dateRange.start)
      start.setHours(0, 0, 0, 0)

      end = new Date(options.dateRange.end)
      end.setHours(23, 59, 59, 999)
    }

    const query = this.budgetRepository
      .createQueryBuilder('budget')
      .leftJoinAndSelect('budget.users', 'user')
      .leftJoinAndSelect('budget.transactions', 'transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.user', 'transactionUser')
      .where('budget.id = :id', { id: budgetId })
      .andWhere(
        new Brackets(qb => {
          qb.where('budget.owner.id = :userId', { userId }).orWhere('user.id = :userId', { userId })
        }),
      )
      .andWhere('transaction.type = :type', { type: options.type })

    if (options.category) {
      query.andWhere('category.name = :name', { name: options.category })
    }

    if (start && end) {
      query.andWhere('transaction.date BETWEEN :start AND :end', { start, end })
    }

    const budget = await query.getOne()

    return budget ? budget.transactions : null
  }
}
