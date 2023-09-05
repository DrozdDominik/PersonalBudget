import { forwardRef, Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { Transaction } from "./transaction.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryModule } from "../category/category.module";
import { BudgetModule } from "../budget/budget.module";

@Module({
  imports:[
      TypeOrmModule.forFeature([Transaction]),
      forwardRef(() => CategoryModule),
      forwardRef(() => BudgetModule)
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService]
})
export class TransactionModule {}
