import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { UserId, UserRole } from './types'
import { Transaction } from '../transaction/transaction.entity'
import { Category } from '../category/category.entity'
import { Budget } from '../budget/budget.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: UserId

  @Column({
    length: 30,
  })
  name: string

  @Column({
    length: 50,
  })
  email: string

  @Column({
    length: 128,
  })
  passwordHash: string

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.User,
  })
  role: UserRole

  @Column({
    nullable: true,
    default: null,
  })
  currentToken: string | null

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions: Transaction[]

  @OneToMany(() => Category, category => category.user)
  categories: Category[]

  @OneToMany(() => Budget, budget => budget.owner)
  ownBudgets: Budget[]

  @ManyToMany(() => Budget, budget => budget.users)
  @JoinTable()
  sharedBudgets: Promise<Budget[]>
}