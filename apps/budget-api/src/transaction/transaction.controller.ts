import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { TransactionService } from './transaction.service'
import { Transaction } from './transaction.entity'
import { CreateTransactionDto } from './dtos/create-transaction.dto'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from '../decorators/current-user.decorator'
import { User } from '../user/user.entity'
import { Serialize } from '../interceptors/serialize.interceptor'
import { TransactionResponse } from './dtos/transaction-response'
import { EditTransactionDto } from './dtos/edit-transaction.dto'
import { TransactionIdentificationData } from '../types'
import { UserIdentificationData } from '../user/types'
import { TransactionId } from './types'

@Controller('transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @UseGuards(AuthGuard('jwt'))
  @Serialize(TransactionResponse)
  @Post('/')
  createTransaction(
    @Body() newIncome: CreateTransactionDto,
    @CurrentUser() user: User,
  ): Promise<Transaction> {
    return this.transactionService.create(newIncome, user)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(TransactionResponse)
  @Patch('/:id')
  editTransaction(
    @Param('id') id: TransactionId,
    @Body() editedData: EditTransactionDto,
    @CurrentUser() user: User,
  ): Promise<Transaction> {
    const identificationData: TransactionIdentificationData = {
      transactionId: id,
      user: {
        id: user.id,
        role: user.role,
      },
    }
    return this.transactionService.edit(identificationData, editedData)
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/:id')
  deleteTransaction(@Param('id') id: TransactionId, @CurrentUser() user: User): Promise<boolean> {
    const userData: UserIdentificationData = {
      id: user.id,
      role: user.role,
    }

    return this.transactionService.delete(id, userData)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(TransactionResponse)
  @Get('/')
  getAll(@CurrentUser() user: User): Promise<Transaction[]> {
    const userData: UserIdentificationData = {
      id: user.id,
      role: user.role,
    }
    return this.transactionService.getAll(userData)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(TransactionResponse)
  @Get('/:id')
  getOne(@Param('id') id: TransactionId, @CurrentUser() user: User): Promise<Transaction> {
    const userData: UserIdentificationData = {
      id: user.id,
      role: user.role,
    }
    return this.transactionService.getOne(id, userData)
  }
}
