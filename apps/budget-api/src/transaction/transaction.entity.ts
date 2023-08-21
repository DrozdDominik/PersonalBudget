import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";
import { Category } from "../category/category.entity";
import { TransactionId, TransactionType } from "./types";

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn("uuid")
    id: TransactionId;

    @Column({
        type: "enum",
        enum: TransactionType
    })
    type: TransactionType

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        unsigned: true,
        default: 0
    })
    amount: number

    @Column({
        type: "date"
    })
    date: Date

    @Column({
        length: 250,
        nullable: true,
        default: null
    })
    comment: string | null

    @ManyToOne(() => User, user => user.transactions, {onDelete: "CASCADE"})
    user: User

    @ManyToOne(() => Category, category => category.transactions, {onDelete: "SET NULL"})
    category: Category
}