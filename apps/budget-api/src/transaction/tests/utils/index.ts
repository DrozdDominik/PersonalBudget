import { Transaction } from "../../transaction.entity";
import { faker } from "@faker-js/faker";
import { User } from "../../../user/user.entity";
import { Category } from "../../../category/category.entity";
import { UserId } from "../../../user/types";
import { TransactionId, TransactionType } from "../../types";


export const transactionFactory = (quantity: number, type: TransactionType,  userId: UserId | null = null): Transaction[]  => {
    if (quantity <= 0) {
        throw new Error('Quantity must be integer greater than zero')
    }

    const transactions: Transaction[] = []

    for (let i = 0; i < quantity; i++) {
        const transaction: Transaction = {
            id: faker.string.uuid() as TransactionId,
            type,
            amount: Number(faker.finance.amount(0, 1000000, 2)),
            date: faker.date.anytime(),
            comment: null,
            category: {
                id: faker.string.uuid(),
            } as Category,
            user: {
                id: userId ?? faker.string.uuid()
            } as User,
        }

        transactions.push(transaction)
    }

    return transactions
}