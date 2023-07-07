import { Module } from '@nestjs/common';
import { IncomeController } from './income.controller';
import { IncomeService } from './income.service';
import { Income } from "./income.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports:[TypeOrmModule.forFeature([Income])],
  controllers: [IncomeController],
  providers: [IncomeService]
})
export class IncomeModule {}
