import {HttpException, Injectable} from "@nestjs/common";
import {EntityManager, Repository} from "typeorm";
import {BankAccount} from "../../../entities/bank-account.entity";
import {BankTransaction} from "../../../entities/bank-transaction.entity";
import {Person} from "../../../entities/person.entity";

@Injectable()
export class BankAccountService {
    private bankAccountRepository: Repository<BankAccount>;

    public constructor(entityManager: EntityManager) {
        this.bankAccountRepository = entityManager.getRepository(BankAccount);
    }

    /**
     * Fetches a single bank account with the given iban from the database.
     *
     * @param {string} iban The iban for the account.
     * @returns {Promise<BankAccount>} or null, if there is no account with the given iban.
     */
    public async fetchBankAccount(iban: string): Promise<BankAccount | null> {
        return this.bankAccountRepository.findOneBy({iban});
    }

    /**
     * Fetches all bank accounts from the database.
     *
     * @returns {Promise<BankAccount>} all accounts or an empty array if there are none.
     */
    public async fetchAllBankAccounts(): Promise<BankAccount[]> {
        return this.bankAccountRepository.find();
    }

    /**
     * Fetches all bank accounts of the given person.
     *
     * @param {Person} person The person to fetch the bank accounts for.
     * @returns {Promise<BankAccount[]>} The bank accounts or an empty array if there are none.
     */
    public async fetchBankAccountsForPerson(person: Person): Promise<BankAccount[]> {
        return this.bankAccountRepository.findBy({owner: person});
    }

    /**
     * Validates the iban and fetches the corresponding bank account from the database.
     *
     * @param {string} iban The iban to check
     * @returns {Promise<BankAccount>} The corresponding bank account if there is any.
     * @throws {HttpException} If the iban is invalid or if there is no bank account.
     */
    public async validateAndFetchBankAccount(iban: string): Promise<BankAccount> {
        if (!iban) {
            throw new HttpException(`iban is not valid. IBAN: ${iban}`, 422);
        }
        const account = await this.fetchBankAccount(iban);
        if (!account) {
            throw new HttpException(`bank account not found. IBAN: ${iban}`, 422);
        }
        return account;
    }

    /**
     * Calculates the new balance for the bank accounts after the transaction.
     * Note: It does not set the transaction to processed. It just updates the balances.
     *
     * @param {BankTransaction} transaction The transaction to process
     */
    public async updateBalance(transaction: BankTransaction): Promise<void> {
        const targetAccount = await this.bankAccountRepository.findOneBy({iban: transaction.targetIban});
        // Also get the sender account from the database because of persistence issues.
        // Not ideal, as it will lead to more requests to the db for bigger datasets.
        const senderAccount = await this.bankAccountRepository.findOneBy({iban: transaction.senderAccount.iban});

        senderAccount.balance -= transaction.amount;

        if (!targetAccount) {
            console.log("IBAN is external"); // if external IBANs are possible, error otherwise
        } else {
            targetAccount.balance += transaction.amount;
        }

        await this.bankAccountRepository.save([targetAccount, senderAccount]);
    }
}