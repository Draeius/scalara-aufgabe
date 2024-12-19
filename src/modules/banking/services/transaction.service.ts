import {HttpException, Injectable} from "@nestjs/common";
import {EntityManager, Repository} from "typeorm";
import {BankTransaction} from "../../../entities/bank-transaction.entity";
import {BankAccountService} from "./bank-account.service";
import {Person} from "../../../entities/person.entity";
import {BankAccount} from "../../../entities/bank-account.entity";
import {ValidationUtil} from "../../../utils/validation.util";

@Injectable()
export class TransactionService {
    private transactionRepository: Repository<BankTransaction>;

    public constructor(
        entityManager: EntityManager,
        private bankAccountService: BankAccountService) {
        this.transactionRepository = entityManager.getRepository(BankTransaction);
    }

    /**
     * Fetches a single transaction by its ID.
     *
     * @param {number} id The ID of the transaction to fetch.
     * @returns A promise that resolves to the BankTransaction with the specified ID or null if there is none.
     */
    public async fetchTransaction(id: number): Promise<BankTransaction | null> {
        return this.transactionRepository.findOneBy({id});
    }

    /**
     * Fetches all transactions.
     *
     * @returns {Promise<BankTransaction[]>} A promise that resolves to an array of all BankTransaction objects.
     */
    public async fetchAllTransactions(): Promise<BankTransaction[]> {
        return this.transactionRepository.find();
    }

    /**
     * Validates and fetches a transaction by its ID. Ensures the ID is a valid positive integer.
     *
     * @param {string} id The ID of the transaction as a string.
     * @returns {Promise<BankTransaction | null>} A promise that resolves to the validated BankTransaction object
     * or null if the ID is not present.
     * @throws {HttpException} if the provided ID is not valid.
     */
    public async validateAndFetchTransaction(id: string): Promise<BankTransaction | null> {
        return this.fetchTransaction(ValidationUtil.parseID(id));
    }

    /**
     * Fetches all transactions related to a specific person by retrieving their associated accounts.
     *
     * @param {Person} person The Person object to fetch transactions for.
     * @returns {Promise<BankTransaction[]>}A promise that resolves to an array of BankTransaction objects
     * associated with the person's accounts.
     */
    public async fetchTransactionsForPerson(person: Person): Promise<BankTransaction[]> {
        const accounts = await this.bankAccountService.fetchBankAccountsForPerson(person);

        const transactions: BankTransaction[] = [];

        for (const account of accounts) {
            transactions.push(...await this.fetchTransactionForAccount(account));
        }
        return transactions;
    }

    /**
     * Fetches all transactions associated with a specific bank account.
     * Transactions include those where the account is either the sender or the target.
     *
     * @param {BankAccount} account The BankAccount object to fetch transactions for.
     * @returns {Promise<BankTransaction[]>} A promise that resolves to an array of BankTransaction objects
     * for the account.
     */
    public async fetchTransactionForAccount(account: BankAccount): Promise<BankTransaction[]> {
        return [
            ...await this.transactionRepository.findBy({senderAccount: account}),
            ...await this.transactionRepository.findBy({targetIban: account.iban}),
        ];
    }

    /**
     * Processes all unprocessed transactions. Updates the associated account balances
     * and marks transactions as processed in the database.
     */
    public async processAllTransactions(): Promise<void> {
        const unprocessedTransactions = await this.fetchUnprocessedTransactions();

        for (const transaction of unprocessedTransactions) {
            await this.bankAccountService.updateBalance(transaction);
            transaction.processed = true;
        }

        // Save all updated transactions at once
        await this.transactionRepository.save(unprocessedTransactions);
    }

    /**
     * Fetches all unprocessed transactions, including relations with the sender account.
     *
     * @returns {Promise<BankTransaction[]>} A promise that resolves to an array of unprocessed BankTransaction objects.
     */
    private async fetchUnprocessedTransactions(): Promise<BankTransaction[]> {
        return this.transactionRepository.find({
            relations: {senderAccount: true},
            where:     {processed: false},
        });
    }
}