import {Controller, Get, Param, Query} from "@nestjs/common";
import {BankAccount} from "../../../entities/bank-account.entity";
import {BankAccountService} from "../services/bank-account.service";
import {PersonService} from "../services/person.service";

@Controller("account")
export class BankAccountController {

    constructor(private personService: PersonService, private bankAccountService: BankAccountService) {
    }

    /**
     * Handles a GET request to retrieve bank account information.
     * If no IBAN is provided, returns all bank accounts.
     * If an IBAN is provided, validates the IBAN and retrieves the corresponding bank account.
     *
     * @param {string} iban - (Optional) The IBAN of the bank account to retrieve.
     * @returns {Promise<BankAccount[] | BankAccount | null>} A promise that resolves to:
     *          - An array of all BankAccount objects if no IBAN is provided.
     *          - A single BankAccount object if a valid IBAN is provided.
     * @throws {HttpException} If there is an ID but the provided ID is not valid.
     */
    @Get()
    public async getBankAccount(@Query("iban") iban?: string): Promise<BankAccount[] | BankAccount | null> {
        if (!iban) {
            return this.bankAccountService.fetchAllBankAccounts();
        }
        return this.bankAccountService.validateAndFetchBankAccount(iban);
    }

    /**
     * Handles a GET request to retrieve bank accounts associated with a specific person.
     * Validates the person ID, retrieves the corresponding Person object, and fetches all associated bank accounts.
     *
     * @param {string} personId - The ID of the person whose bank accounts are to be retrieved.
     * @returns {Promise<BankAccount[]>} A promise that resolves to an array of BankAccount objects owned by
     * the specified person.
     * @throws {HttpException} If the provided ID is not valid or there is no such person.
     */
    @Get(":personId")
    public async getBankAccountForPerson(@Param("personId") personId: string): Promise<BankAccount[]> {
        const person = await this.personService.validateAndFetchPerson(personId);
        return this.bankAccountService.fetchBankAccountsForPerson(person);
    }
}