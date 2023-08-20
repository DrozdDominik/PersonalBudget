import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Transaction } from "../transaction/transaction.entity";
import { User } from "../user/user.entity";
import { CategoryId } from "./types";

@Entity()
export class Category {
    @PrimaryGeneratedColumn("uuid")
    id: CategoryId;

    @Column({
        length: 30,
        nullable: true,
    })
    name: string;

    @Column()
    isDefault: boolean

    @ManyToOne(() => User, user => user.categories, {onDelete: "CASCADE"})
    user: User

    @OneToMany(() => Transaction, transaction => transaction.category)
    transactions: Transaction[]
}