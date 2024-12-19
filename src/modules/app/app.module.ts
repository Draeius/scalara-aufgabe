import {Module} from "@nestjs/common";
import {BankingModule} from "../banking/banking.module";

@Module({
    imports:     [BankingModule],
    controllers: [],
    providers:   [],
})
export class AppModule {
}
