import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserId, UserRole } from "./types";
import { Income } from "../income/income.entity";
import { Category } from "../category/category.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: UserId;

    @Column({
        length: 30,
    })
    name: string;

    @Column({
        length: 50,
    })
    email: string;

    @Column({
        length: 128,
    })
    passwordHash: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.User
    })
    role: UserRole

    @Column({
        nullable: true,
        default: null,
    })
    currentToken: string | null

    @OneToMany(() => Income, income => income.user )
    incomes: Income[]

    @OneToMany(() => Category, category => category.user )
    categories: Category[]
}