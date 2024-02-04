import { IsDateString, IsOptional, IsString } from 'class-validator'

export class DateQueryParamsDto {
  @IsOptional()
  @IsDateString()
  start: string

  @IsOptional()
  @IsDateString()
  end: string
}

export class CategoryAndDateQueryParamsDto {
  @IsOptional()
  @IsString()
  category: string

  @IsOptional()
  @IsDateString()
  start: string

  @IsOptional()
  @IsDateString()
  end: string
}
