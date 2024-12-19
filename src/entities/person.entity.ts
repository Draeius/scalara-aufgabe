import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {BankAccount} from "./bank-account.entity";


@Entity("person")
export class Person {
    /**
     * ID of this person.
     */
    @PrimaryGeneratedColumn("increment")
    id: number;

    /**
     * The person's name.
     */
    @Column("varchar", {length: 255})
    name: string;

    /**
     * The person's email.
     */
    @Column("varchar", {length: 255})
    email: string;

    /**
     * The person's net worth, that is the sum of all the person's bank account balances.
     */
    @Column("float", {name: "net_worth"}) // could also be a decimal with scale 2 and varying precision
    netWorth: number;

    /**
     * The maximum amount this person can borrow from his friends.
     */
    @Column("float", {name: "max_borrow"}) // could also be a decimal with scale 2 and varying precision
    maxBorrow: number;

    /**
     * The people this person considers as friends.
     */
    @ManyToMany(() => Person, (person) => person.friendOf)
    @JoinTable({
        name:              "person_friends",
        joinColumn:        {name: "person_id", referencedColumnName: "id"},
        inverseJoinColumn: {name: "friend_id", referencedColumnName: "id"},
    })
    hasFriend: Person[];

    /**
     * Inverse side of hasFriend.
     */
    @ManyToMany(() => Person, (person) => person.hasFriend)
    friendOf: Person[];

    /**
     * Relation to bank accounts.
     */
    @OneToMany(() => BankAccount, (bankAccount) => bankAccount.owner)
    bankAccounts: BankAccount[];
}