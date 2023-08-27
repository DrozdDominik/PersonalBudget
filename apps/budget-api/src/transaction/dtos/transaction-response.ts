import { Expose, Transform } from "class-transformer";
import { UserId } from "../../user/types";
import { TransactionId, TransactionType } from "../types";

export class TransactionResponse {
    @Expose()
    id: TransactionId

    @Expose()
    type: TransactionType

    @Transform(({ obj }) => obj.category.name)
    @Expose()
    name: string

    @Expose()
    amount: number

    @Expose()
    date: Date

    @Expose()
    comment: string | null

    @Transform(({ obj }) => obj.user.id)
    @Expose()
    userId: UserId
}