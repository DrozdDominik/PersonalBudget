import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Budget } from './budget.entity'
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm'
import { User } from '../user/user.entity'
import { UserId, UserRole } from '../user/types'
import { BudgetId, BudgetNameAndTransactions, BudgetWithUsers, SearchOptions } from './types'
import { UserService } from '../user/user.service'
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
    return await this.budgetRepository
      .findOne({
        where: {
          name,
          owner: {
            id: ownerId,
          },
        },
      })
      .catch(() => {
        throw new Error(`An error occurred while retrieving budget data.`)
      })
  }

  async findBudgetById(id: BudgetId): Promise<Budget | null> {
    return await this.budgetRepository
      .findOne({
        relations: {
          owner: true,
          users: true,
          transactions: true,
        },
        where: {
          id,
        },
      })
      .catch(() => {
        throw new Error(`An error occurred while retrieving budget data.`)
      })
  }

  async findBudgetByIdAndOwner(id: BudgetId, ownerId: UserId): Promise<Budget | null> {
    const budget = await this.getBudgetById(id)
    this.assertOwnership(budget, ownerId)
    return budget
  }

  private joinUsersQuery(): SelectQueryBuilder<Budget> {
    return this.budgetRepository
      .createQueryBuilder('budget')
      .leftJoinAndSelect('budget.users', 'user')
  }

  private joinUsersOwnerTransactionQuery(): SelectQueryBuilder<Budget> {
    return this.joinUsersQuery()
      .leftJoinAndSelect('budget.owner', 'owner')
      .leftJoinAndSelect('budget.transactions', 'transactions')
  }

  private joinUsersTransactionQuery(): SelectQueryBuilder<Budget> {
    return this.joinUsersQuery()
      .leftJoinAndSelect('budget.transactions', 'transactions')
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.user', 'transactionUser')
  }

  private joinUsersOwnerQuery(): SelectQueryBuilder<Budget> {
    return this.joinUsersQuery().leftJoinAndSelect('budget.owner', 'owner')
  }

  private async loadBudgetUsers(budget: Budget): Promise<User[]> {
    return await this.budgetRepository
      .createQueryBuilder('budget')
      .relation(Budget, 'users')
      .of(budget)
      .loadMany()
      .catch(() => {
        throw new Error(`An error occurred while retrieving budget users data.`)
      })
  }

  async getBudgetTransactions(
    id: BudgetId,
    userId: UserId,
    dateRange: DateRange,
  ): Promise<Transaction[] | null> {
    const query = this.joinUsersTransactionQuery()
      .where('budget.id = :id', { id })
      .andWhere(
        new Brackets(qb => {
          qb.where('budget.owner.id = :userId', { userId }).orWhere('user.id = :userId', { userId })
        }),
      )

    if (dateRange.start && dateRange.end) {
      query.andWhere('transaction.date BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      })
    }

    const budget = await query.getOne().catch(() => {
      throw new Error(`An error occurred while retrieving budget transactions data.`)
    })

    return budget ? budget.transactions : null
  }

  async getBudgetIfUserHasAccess(id: BudgetId, userId: UserId): Promise<Budget | null> {
    return await this.joinUsersQuery()
      .where('budget.id = :id', { id })
      .andWhere(
        new Brackets(qb => {
          qb.where('budget.owner.id = :userId', { userId }).orWhere('user.id = :userId', { userId })
        }),
      )
      .getOne()
      .catch(() => {
        throw new Error(`An error occurred while retrieving budget data.`)
      })
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

    return this.budgetRepository.save(budget).catch(() => {
      throw new Error(`Create new budget failed`)
    })
  }

  async getBudget(budgetId: BudgetId, user: User): Promise<BudgetWithUsers> {
    const budget = await this.joinUsersOwnerTransactionQuery()
      .where('budget.id = :id', { id: budgetId })
      .leftJoinAndSelect('budget.users', 'users')
      .getOne()
      .catch(() => {
        throw new Error(`An error occurred while retrieving budget data.`)
      })

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${budgetId} not found`)
    }

    this.checkAccess(budget, user)

    return budget
  }

  async addUser(budgetId: BudgetId, ownerId: UserId, newUserId: UserId): Promise<BudgetWithUsers> {
    const budget = await this.findBudgetByIdAndOwner(budgetId, ownerId)

    if (ownerId === newUserId) {
      throw new BadRequestException('Cannot share budget with yourself')
    }

    const newUser = await this.userService.findUser(newUserId)

    if (this.isUser(budget, newUser)) {
      throw new BadRequestException('Already has access')
    }

    budget.users.push(newUser)

    return await this.budgetRepository.save(budget).catch(() => {
      throw new Error(`Add budget user failed`)
    })
  }

  async getAllOwnBudgets(ownerId: UserId): Promise<BudgetWithUsers[]> {
    return this.joinUsersOwnerTransactionQuery()
      .where('owner.id = :userId', { userId: ownerId })
      .getMany()
      .catch(() => {
        throw new Error(`An error occurred while retrieving budgets data.`)
      })
  }

  async getAllSharedBudgets(userId: UserId): Promise<BudgetWithUsers[]> {
    const budgets = await this.joinUsersOwnerTransactionQuery()
      .where('owner.id != :userId', { userId })
      .andWhere('user.id = :userId', { userId })
      .getMany()
      .catch(() => {
        throw new Error(`An error occurred while retrieving budgets data.`)
      })

    return await Promise.all(
      budgets.map(async budget => {
        const users = await this.loadBudgetUsers(budget)
        return {
          ...budget,
          users,
        }
      }),
    )
  }

  async getAllUserBudgets(userId: UserId): Promise<BudgetWithUsers[]> {
    const budgets = await this.joinUsersOwnerTransactionQuery()
      .where('owner.id = :userId', { userId })
      .orWhere('user.id = :userId', { userId })
      .getMany()
      .catch(() => {
        throw new Error(`An error occurred while retrieving budgets data.`)
      })

    return await Promise.all(
      budgets.map(async budget => {
        const users = await this.loadBudgetUsers(budget)
        return {
          ...budget,
          users,
        }
      }),
    )
  }

  async getAllBudgetsNamesAndTransactions(
    userId: UserId,
    dateRange: DateRange,
  ): Promise<BudgetNameAndTransactions[]> {
    let budgets: Budget[]

    const query = this.joinUsersTransactionQuery().andWhere(
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
        .catch(() => {
          throw new Error(`An error occurred while retrieving budgets data.`)
        })
    } else {
      budgets = await query.getMany().catch(() => {
        throw new Error(`An error occurred while retrieving budgets data.`)
      })
    }

    return budgets.map(budget => ({
      name: budget.name,
      transactions: budget.transactions,
    }))
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

    return await this.budgetRepository.save(budget).catch(() => {
      throw new Error(`Edit budget name failed`)
    })
  }

  async removeUser(budgetId: BudgetId, ownerId: UserId, userId: UserId): Promise<BudgetWithUsers> {
    const budget = await this.findBudgetByIdAndOwner(budgetId, ownerId)

    const user = await this.userService.findUser(userId)

    if (!this.isUser(budget, user)) {
      throw new NotFoundException('There is no such budget user')
    }

    budget.users = budget.users.filter(user => user.id !== userId)

    await this.budgetRepository.save(budget).catch(() => {
      throw new Error(`Remove budget user failed`)
    })

    return budget
  }

  async delete(budgetId: BudgetId, user: User): Promise<void> {
    const budget = await this.findBudgetById(budgetId)

    this.checkDeletionPermissions(budget, user)

    await this.budgetRepository.delete(budgetId).catch(() => {
      throw new Error(`Delete budget ${budgetId} failed`)
    })
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

    const query = this.joinUsersTransactionQuery()
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

    const budget = await query.getOne().catch(() => {
      throw new Error(`An error occurred while retrieving budget transactions.`)
    })

    return budget ? budget.transactions : null
  }

  private isOwner(budget: Budget, userId: UserId): boolean {
    return budget.owner.id === userId
  }

  private isUser(budget: Budget, user: User): boolean {
    return budget.users.some(u => u.id === user.id)
  }

  private isAdmin(user: User): boolean {
    return user.role === UserRole.Admin
  }

  private async getBudgetById(id: BudgetId): Promise<Budget> {
    const budget = await this.joinUsersOwnerQuery()
      .where('budget.id = :id', { id })
      .getOne()
      .catch(() => {
        throw new Error(`An error occurred while retrieving budget data.`)
      })

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`)
    }
    return budget
  }

  private checkAccess(budget: Budget, user: User): void {
    if (!this.isOwner(budget, user.id) && !this.isUser(budget, user) && !this.isAdmin(user)) {
      throw new ForbiddenException(`User with ID ${user.id} does not have access to the budget`)
    }
  }

  private checkDeletionPermissions(budget: Budget, user: User): void {
    if (!this.isOwner(budget, user.id) && !this.isAdmin(user)) {
      throw new ForbiddenException(
        `User with ID ${user.id} does not have permission to delete budget`,
      )
    }
  }

  private assertOwnership(budget: Budget, userId: UserId) {
    if (!this.isOwner(budget, userId)) {
      throw new ForbiddenException(`User with ID ${userId} is not the owner of the budget`)
    }
  }
}
