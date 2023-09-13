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
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { UserId, UserRole } from '../user/types';
import { TransactionService } from '../transaction/transaction.service';
import { BudgetId, BudgetWithUsers } from './types';
import { UserService } from '../user/user.service';

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
}
