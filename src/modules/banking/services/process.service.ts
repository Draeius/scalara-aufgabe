import {HttpException, Injectable} from "@nestjs/common";
import {TransactionService} from "./transaction.service";
import {PersonService} from "./person.service";
import {ValidationUtil} from "../../../utils/validation.util";

@Injectable()
export class ProcessService {

    public constructor(private transactionService: TransactionService,
                       private personService: PersonService) {
    }

    /**
     * Validates the provided process ID and executes the corresponding process steps.
     *
     * @param {string} processId - The process ID to validate and execute. Must be a valid string representation
     * of a positive integer.
     * @returns {Promise<string>} - A promise that resolves to an object containing a success message.
     * @throws {HttpException} - Throws an exception if the processId is invalid (not provided, not a number,
     * or less than or equal to 0).
     */
    public async validateAndExecuteProcess(processId: string): Promise<string> {
        return this.process(ValidationUtil.parseID(processId));
    }

    /**
     * Executes a series of processes based on the given process ID.
     *
     * - Always processes all transactions (Process 1).
     * - If processId >= 2, calculates the net worth.
     * - If processId >= 3, calculates the maximum amount that can be borrowed.
     *
     * @param {number} processId - A positive integer indicating the process steps to execute.
     * @returns {Promise<string>} - A promise that resolves to an object containing a success
     * message for the executed processes.
     */
    public async process(processId: number): Promise<string> {
        // always process the transactions (Process 1)
        await this.transactionService.processAllTransactions();

        // process ID is 2 or more -> get NetWorth
        if (processId >= 2) {
            await this.personService.processNetWorth();
        }

        // process ID is 3 or more -> calculate max borrowed
        if (processId >= 3) {
            await this.personService.processMaxBorrow();
        }
        return `The processes up to process ${processId} ran successfully`;
    }
}