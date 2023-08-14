import { Expose, Transform } from "class-transformer";
import { UserId } from "../../user/types";

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
    userId: UserId
}

export class GetCategoriesResponse {
    @Expose()
    id: string

    @Expose()
    name: string
}