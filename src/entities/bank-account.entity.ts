import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {Person} from "./person.entity";

@Entity("bank_account")
export class BankAccount {
    /**
     * This bank account's IBAN.
     * It's the primary key.
     */
    @PrimaryColumn("varchar", {length: 34})
    iban: string;

    /**
     * This bank account's balance.
     */
    @Column("float")
    balance: number;

    /**
     * This bank account's owner.
     */
    @ManyToOne(() => Person, (person) => person.bankAccounts)
    @JoinColumn({name: "owner_id"}) // Foreign key column
    owner: Person;
}
