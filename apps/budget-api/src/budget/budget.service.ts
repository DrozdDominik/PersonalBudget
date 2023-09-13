import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Budget } from './budget.entity';
import { Not, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { UserId, UserRole } from '../user/types';
import { TransactionService } from '../transaction/transaction.service';
import { BudgetId, BudgetWithUsers } from './types';
import { UserService } from '../user/user.service';
import {
  filterBudgetsBySharedUserId,
  filterBudgetsByUserId,
  isUserAmongBudgetUsers,
} from './utils';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    @Inject(forwardRef(() => TransactionService))
    private transactionService: TransactionService,
    @Inject(UserService) private userService: UserService,
  ) {}

  async findBudgetByOwnerAndName(
    name: string,
    ownerId: UserId,
  ): Promise<Budget | null> {
    return await this.budgetRepository.findOne({
      where: {
        name,
        owner: {
          id: ownerId,
        },
      },
    });
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
    });
  }

  async create(name: string, owner: User): Promise<Budget> {
    const newBudgetName = name.trim().toLowerCase();
    const existBudget = await this.findBudgetByOwnerAndName(
      newBudgetName,
      owner.id,
    );

    if (existBudget) {
      throw new BadRequestException();
    }

    const budget = this.budgetRepository.create({
      name: newBudgetName,
      owner,
    });

    return this.budgetRepository.save(budget);
  }

  async get(budgetId: BudgetId, user: User): Promise<BudgetWithUsers> {
    const budget = await this.findBudgetById(budgetId);

    if (!budget) {
      throw new NotFoundException();
    }
    if (budget.owner.id !== user.id && user.role !== UserRole.Admin) {
      throw new ForbiddenException();
    }

    const users = await budget.users;
    return {
      id: budget.id,
      name: budget.name,
      owner: budget.owner,
      users,
      transactions: budget.transactions,
    };
  }

  async addUser(
    budgetId: BudgetId,
    ownerId: UserId,
    newUserId: UserId,
  ): Promise<BudgetWithUsers> {
    const budget = await this.findBudgetById(budgetId);

    if (!budget) {
      throw new NotFoundException('budget');
    }

    if (budget.owner.id !== ownerId) {
      throw new BadRequestException('Not your budget');
    }

    if (ownerId === newUserId) {
      throw new BadRequestException('Cannot share budget with yourself');
    }

    const newUser = await this.userService.findOneById(newUserId);

    if (!newUser) {
      throw new NotFoundException('user');
    }

    const budgetUsers = await budget.users;

    if (isUserAmongBudgetUsers(newUserId, budgetUsers)) {
      throw new BadRequestException('Already have access');
    }

    budgetUsers.push(newUser);

    budget.users = Promise.resolve(budgetUsers);

    try {
      await this.budgetRepository.save(budget);
    } catch (e) {
      throw new Error(e);
    }

    return {
      id: budget.id,
      name: budget.name,
      owner: budget.owner,
      users: budgetUsers,
      transactions: budget.transactions,
    };
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
    });

    return await Promise.all(
      budgets.map(async (budget) => {
        const users = await budget.users;
        return {
          id: budget.id,
          name: budget.name,
          owner: budget.owner,
          users,
          transactions: budget.transactions,
        };
      }),
    );
  }

  async getAllSharedBudgets(userId: UserId): Promise<BudgetWithUsers[]> {
    const budgets = await this.budgetRepository.find({
      relations: {
        owner: true,
        users: true,
        transactions: true,
      },
      where: {
        owner: Not(userId),
      },
    });

    const budgetsWithUsers: BudgetWithUsers[] = await Promise.all(
      budgets.map(async (budget) => {
        const users = await budget.users;
        return {
          id: budget.id,
          name: budget.name,
          owner: budget.owner,
          users,
          transactions: budget.transactions,
        };
      }),
    );

    return filterBudgetsBySharedUserId(budgetsWithUsers, userId);
  }

  async getAllUserBudgets(userId: UserId): Promise<BudgetWithUsers[]> {
    const budgets = await this.budgetRepository.find({
      relations: {
        owner: true,
        users: true,
        transactions: true,
      },
    });

    const budgetsWithUsers: BudgetWithUsers[] = await Promise.all(
      budgets.map(async (budget) => {
        const users = await budget.users;
        return {
          id: budget.id,
          name: budget.name,
          owner: budget.owner,
          users,
          transactions: budget.transactions,
        };
      }),
    );

    return filterBudgetsByUserId(budgetsWithUsers, userId);
  }
}
