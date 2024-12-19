import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {BankAccount} from "./bank-account.entity";


@Entity("person")
export class Person {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column("varchar", {length: 255})
    name: string;

    @Column("varchar", {length: 255})
    email: string;

    @Column("float", {name: "net_worth"}) // could also be a decimal with scale 2 and varying precision
    netWorth: number;

    @Column("float", {name: "max_borrow"}) // could also be a decimal with scale 2 and varying precision
    maxBorrow: number;

    // Self-referencing Many-to-Many relation: has friends
    @ManyToMany(() => Person, (person) => person.friendOf)
    @JoinTable({
        name:              "person_friends",
        joinColumn:        {name: "person_id", referencedColumnName: "id"},
        inverseJoinColumn: {name: "friend_id", referencedColumnName: "id"},
    })
    hasFriend: Person[];

    // Inverse side of hasFriend
    @ManyToMany(() => Person, (person) => person.hasFriend)
    friendOf: Person[];

    // Relation to bank accounts
    @OneToMany(() => BankAccount, (bankAccount) => bankAccount.owner)
    bankAccounts: BankAccount[];
}