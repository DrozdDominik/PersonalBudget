import { Expose, Transform } from 'class-transformer'

export class IncomesDto {
  @Transform(({ obj }) => obj.category.name)
  @Expose()
  category: string

  @Expose()
  amount: number

  @Expose()
  date: string

  @Expose()
  comment: string | null

  @Transform(({ obj }) => obj.user.name)
  @Expose()
  user: string
}
