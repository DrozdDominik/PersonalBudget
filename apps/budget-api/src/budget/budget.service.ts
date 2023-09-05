import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Budget } from "./budget.entity";
import { Repository } from "typeorm";
import { TransactionService } from "../transaction/transaction.service";
import { UserService } from "../user/user.service";

@Injectable()
export class BudgetService {
    constructor(
        @InjectRepository(Budget)
        private budgetRepository: Repository<Budget>,
        @Inject(forwardRef( () => TransactionService)) private transactionService: TransactionService,
        @Inject(UserService) private userService: UserService,
    ) {}
}
