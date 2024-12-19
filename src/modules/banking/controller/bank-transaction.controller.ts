import {Controller, Get, Param, Query} from "@nestjs/common";
import {BankTransaction} from "../../../entities/bank-transaction.entity";
import {TransactionService} from "../services/transaction.service";
import {PersonService} from "../services/person.service";
import {BankAccountService} from "../services/bank-account.service";

@Controller("transactions")
export class BankTransactionController {

    public constructor(private transactionService: TransactionService,
                       private personService: PersonService,
                       private bankAccountService: BankAccountService) {
    }

    /**
     * Handles a GET request to retrieve transactions.
     * If no ID is provided, returns all transactions.
     * If an ID is provided, validates the ID and retrieves the corresponding transaction.
     *
     * @param {string} id - (Optional) The ID of the transaction to retrieve.
     * @returns {Promise<BankTransaction[] | BankTransaction>} A promise that resolves to:
     *          - An array of all BankTransaction objects if no ID is provided.
     *          - A single BankTransaction object if a valid ID is provided.
     *          - Null if the ID is invalid or no transaction is found.
     * @throws {HttpException} If there is an ID and the provided ID is not valid.
     */
    @Get()
    public async getTransactions(@Query("id") id?: string): Promise<BankTransaction[] | BankTransaction> {
        if (!id) {
            return this.transactionService.fetchAllTransactions();
        }
        return this.transactionService.validateAndFetchTransaction(id);
    }

    /**
     * Handles a GET request to retrieve transactions associated with a specific person.
     * Validates the person ID, retrieves the corresponding Person object, and fetches all associated transactions.
     *
     * @param {string} personId - The ID of the person whose transactions are to be retrieved.
     * @returns {Promise<BankTransaction[]>} A promise that resolves to an array of BankTransaction objects
     * associated with the specified person.
     * @throws {HttpException} If the provided ID is not valid or there is no such person.
     */
    @Get("person/:personId")
    public async getTransactionByPerson(@Param("personId") personId: string): Promise<BankTransaction[]> {
        const person = await this.personService.validateAndFetchPerson(personId);
        return this.transactionService.fetchTransactionsForPerson(person);
    }

    /**
     * Handles a GET request to retrieve transactions associated with a specific bank account.
     * Validates the IBAN, retrieves the corresponding BankAccount, and fetches all transactions related to that account.
     *
     * @param {string} iban - The IBAN of the bank account whose transactions are to be retrieved.
     * @returns {Promise<BankTransaction[]>} A promise that resolves to an array of BankTransaction objects
     * related to the specified account.
     * @throws {HttpException} If the provided IBAN is not valid or there is no such bank account.
     */
    @Get("account/:iban")
    public async getTransactionsByAccount(@Param("iban") iban: string): Promise<BankTransaction[]> {
        const account = await this.bankAccountService.validateAndFetchBankAccount(iban);
        return this.transactionService.fetchTransactionForAccount(account);
    }
}