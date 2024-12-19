import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {BankAccount} from "./bank-account.entity";

@Entity("bank_transaction")
export class BankTransaction {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column("float")
    amount: number; // Transaction amount

    @Column("boolean")
    processed: boolean; // Flag if the transaction has been processed

    // Many-to-One relation: Transaction has a sender bank account
    @ManyToOne(() => BankAccount)
    @JoinColumn({name: "sender_iban"}) // Foreign key to sender's bank account
    senderAccount: BankAccount;

    @Column("varchar", {name: "target_iban", length: 34})
    targetIban: string; // Target IBAN for the transaction
}