import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {BankAccount} from "./bank-account.entity";

@Entity("bank_transaction")
export class BankTransaction {
    /**
     * This transaction's id
     */
    @PrimaryGeneratedColumn("increment")
    id: number;

    /**
     * This transaction's amount
     */
    @Column("float")
    amount: number;

    /**
     * This is a flag indicating if the transaction has been processed or not.
     */
    @Column("boolean")
    processed: boolean;

    /**
     * Relation to the bank account this transaction is sent from
     */
    @ManyToOne(() => BankAccount)
    @JoinColumn({name: "sender_iban"})
    senderAccount: BankAccount;

    /**
     * The IBAN of the target bank account
     */
    @Column("varchar", {name: "target_iban", length: 34})
    targetIban: string;
}