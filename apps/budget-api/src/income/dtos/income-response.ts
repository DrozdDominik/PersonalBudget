import { Expose, Transform } from "class-transformer";
import { UserId } from "../../user/types";

export class IncomeResponse {
    @Expose()
    id: string

    @Transform(({ obj }) => obj.category.name)
    @Expose()
    name: string

    @Expose()
    amount: number

    @Expose()
    date: Date

    @Transform(({ obj }) => obj.user.id)
    @Expose()
    userId: UserId
}