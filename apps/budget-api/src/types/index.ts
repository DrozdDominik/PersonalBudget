import { UserId, UserIdentificationData } from "../user/types";
import { CategoryId } from "../category/types";
import { TransactionId } from "../transaction/types";

type DbConfig = {
    host: string
    username: string
    password: string
    database: string
}

type JwtConfig = {
    jwtSecret: string
    expirationTime: number
}

export interface Config {
    db: DbConfig
    jwt: JwtConfig
}

export type TransactionIdentificationData = {
    transactionId: TransactionId
    user: UserIdentificationData
}

export type CustomCategoryIdentificationData = {
    categoryId: CategoryId
    userId: UserId
}