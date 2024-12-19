import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {Person} from "./person.entity";

@Entity("bank_account")
export class BankAccount {
    @PrimaryColumn("varchar", {length: 34}) // IBAN as the primary key
    iban: string;

    @Column("float") // could also be a decimal with scale 2 and varying precision
    balance: number;

    // Many-to-One relation: BankAccount belongs to a single Person
    @ManyToOne(() => Person, (person) => person.bankAccounts)
    @JoinColumn({name: "owner_id"}) // Foreign key column
    owner: Person;
}
