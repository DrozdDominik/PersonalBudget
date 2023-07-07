import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "./types";
import { Income } from "../income/income.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

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
}