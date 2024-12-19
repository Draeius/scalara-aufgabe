import {Module} from "@nestjs/common";
import {TransactionService} from "./services/transaction.service";
import {DbModule} from "../db/db.module";
import {PersonService} from "./services/person.service";
import {BankAccountService} from "./services/bank-account.service";
import {ProcessController} from "./controller/process.controller";
import {PersonController} from "./controller/person.controller";
import {BankAccountController} from "./controller/bank-account.controller";
import {BankTransactionController} from "./controller/bank-transaction.controller";
import {ProcessService} from "./services/process.service";

@Module({
    imports:     [DbModule],
    controllers: [ProcessController, PersonController, BankAccountController, BankTransactionController],
    providers:   [TransactionService, PersonService, BankAccountService, ProcessService],
})
export class BankingModule {
}
