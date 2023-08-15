import { Expose, Transform } from "class-transformer";
import { UserId } from "../../user/types";
import { CategoryId } from "../types";

export class DefaultCategoryResponse {
    @Expose()
    id: CategoryId

    @Expose()
    name: string

    @Expose()
    isDefault: boolean
}

export class CategoryResponse {
    @Expose()
    id: CategoryId

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
    id: CategoryId

    @Expose()
    name: string
}