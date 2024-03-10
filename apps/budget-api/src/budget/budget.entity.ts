import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { BudgetId } from './types'
import { User } from '../user/user.entity'
import { Transaction } from '../transaction/transaction.entity'

@Entity()
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: BudgetId

  @Column({
    length: 30,
  })
  name: string

  @ManyToOne(() => User, user => user.categories, { onDelete: 'CASCADE' })
  owner: User

  @ManyToMany(() => User, user => user.sharedBudgets)
  users: User[]

  @OneToMany(() => Transaction, transaction => transaction.budget)
  transactions: Transaction[]
}
