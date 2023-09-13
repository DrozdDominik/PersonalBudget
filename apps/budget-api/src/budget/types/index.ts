import { Budget } from "../budget.entity";
import { User } from "../../user/user.entity";

export type BudgetId = string & { __BudgetId__: void }

export type BudgetWithUsers = Omit<Budget, 'users' > & { users: User[] }