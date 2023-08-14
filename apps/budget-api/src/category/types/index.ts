import { User } from "../../user/user.entity";

export type CategoryCreateData = {
    name: string,
    isDefault: boolean,
    user: User
}