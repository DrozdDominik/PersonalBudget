import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";
import { Category } from "../category/category.entity";

@Entity()
export class Income {
    @PrimaryGeneratedColumn("uuid")
    id: string;

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

    @ManyToOne(() => User, user => user.incomes)
    user: User

    @ManyToOne(() => Category, category => category.incomes, {onDelete: "SET NULL"})
    category: Category
}