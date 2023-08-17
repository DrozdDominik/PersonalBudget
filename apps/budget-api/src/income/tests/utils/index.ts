import { Income } from "../../income.entity";
import { faker } from "@faker-js/faker";
import { User } from "../../../user/user.entity";
import { Category } from "../../../category/category.entity";
import { UserId } from "../../../user/types";
import { IncomeId } from "../../types";


export const incomeFactory = (quantity: number, userId: UserId | null = null): Income[]  => {
    if (quantity <= 0) {
        throw new Error('Quantity must be integer greater than zero')
    }

    const incomes: Income[] = []

    for (let i = 0; i < quantity; i++) {
        const income: Income = {
            id: faker.string.uuid() as IncomeId,
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

        incomes.push(income)
    }

    return incomes
}