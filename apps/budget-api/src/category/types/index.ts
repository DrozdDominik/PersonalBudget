import { User } from '../../user/user.entity'
import { TransactionType } from '../../transaction/types'

export type CategoryCreateData = {
  name: string
  isDefault: boolean
  transactionType: TransactionType
  user: User
}

export type CategoryId = string & { __CategoryId__: void }