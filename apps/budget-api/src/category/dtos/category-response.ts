import { Expose, Transform } from "class-transformer";
import { UserId } from "../../user/types";
import { CategoryId } from "../types";
import { TransactionType } from "../../transaction/types";

export class DefaultCategoryResponse {
    @Expose()
    id: CategoryId

    @Expose()
    name: string

    @Expose()
    isDefault: boolean

    @Expose()
    transactionType: TransactionType
}

export class CategoryResponse extends DefaultCategoryResponse{
    constructor() {
        super();
    }

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