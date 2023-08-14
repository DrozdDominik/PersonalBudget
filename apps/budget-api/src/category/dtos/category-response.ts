import { Expose, Transform } from "class-transformer";

export class DefaultCategoryResponse {
    @Expose()
    id: string

    @Expose()
    name: string

    @Expose()
    isDefault: boolean
}

export class CategoryResponse {
    @Expose()
    id: string

    @Expose()
    name: string

    @Expose()
    isDefault: boolean

    @Transform(({ obj }) => obj.user.id)
    @Expose()
    userId: string
}

export class GetCategoriesResponse {
    @Expose()
    id: string

    @Expose()
    name: string
}