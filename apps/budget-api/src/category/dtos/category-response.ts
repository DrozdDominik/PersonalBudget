import { Expose } from "class-transformer";

export class DefaultCategoryResponse {
    @Expose()
    id: string

    @Expose()
    name: string

    @Expose()
    isDefault: boolean
}