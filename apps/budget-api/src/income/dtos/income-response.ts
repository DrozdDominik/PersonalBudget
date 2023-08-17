import { Expose, Transform } from "class-transformer";
import { UserId } from "../../user/types";
import { IncomeId } from "../types";

export class IncomeResponse {
    @Expose()
    id: IncomeId

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