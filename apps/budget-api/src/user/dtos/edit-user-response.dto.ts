import { Expose } from 'class-transformer'
import { UserId } from '../types'

export class EditUserResponseDto {
  @Expose()
  id: UserId

  @Expose()
  name: string

  @Expose()
  email: string
}