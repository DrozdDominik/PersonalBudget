import { IsDateString, IsOptional } from 'class-validator'

export class DateQueryParamsDto {
  @IsOptional()
  @IsDateString()
  start: string

  @IsOptional()
  @IsDateString()
  end: string
}
