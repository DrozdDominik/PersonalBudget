import { Expose, Transform } from "class-transformer";

export class IncomeResponse {
    @Expose()
    id: string

    @Expose()
    name: string

    @Expose()
    amount: number

    @Expose()
    date: Date

    @Transform(({ obj }) => obj.user.id)
    @Expose()
    userId: string
}