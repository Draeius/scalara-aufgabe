import {DataSource, DataSourceOptions} from "typeorm";
import "dotenv/config";
import {Person} from "../../entities/person.entity";
import {BankAccount} from "../../entities/bank-account.entity";
import {BankTransaction} from "../../entities/bank-transaction.entity";
import {SeederOptions} from "typeorm-extension";

export const dataSourceOptions: DataSourceOptions & SeederOptions = {
    type:        "postgres",
    host:        process.env.DB_HOST,
    port:        +process.env.DB_PORT,
    username:    process.env.DB_USER,
    password:    process.env.DB_PASSWORD,
    database:    process.env.DB_NAME,
    entities:    [Person, BankAccount, BankTransaction],
    seeds:       ["src/modules/db/seeds/**/*{.ts,.js}"],
    synchronize: true, // in production this should be false. Set to true since this is not production
};

export const dataSource = new DataSource(dataSourceOptions); // only needed for seeding
