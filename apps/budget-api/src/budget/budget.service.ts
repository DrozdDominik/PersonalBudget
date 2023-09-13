import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Budget } from './budget.entity';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { UserId } from '../user/types';
import { TransactionService } from '../transaction/transaction.service';
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
}
