import { forwardRef, Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "./category.entity";
import { TransactionModule } from "../transaction/transaction.module";

@Module({
  imports:[
      TypeOrmModule.forFeature([Category]),
      forwardRef(() => TransactionModule),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
