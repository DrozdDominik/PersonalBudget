import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";

@Entity()
export class Income {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        length: 30,
    })
    name: string;

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
}