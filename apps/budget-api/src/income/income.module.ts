import { forwardRef, Module } from '@nestjs/common';
import { IncomeController } from './income.controller';
import { IncomeService } from './income.service';
import { Income } from "./income.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryModule } from "../category/category.module";

@Module({
  imports:[
      TypeOrmModule.forFeature([Income]),
      forwardRef(() => CategoryModule),
  ],
  controllers: [IncomeController],
  providers: [IncomeService]
})
export class IncomeModule {}
