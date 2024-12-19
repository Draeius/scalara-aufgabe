import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {dataSourceOptions} from "./data-source";
import {Person} from "../../entities/person.entity";

@Module({
    imports: [
        TypeOrmModule.forRoot(dataSourceOptions),
        TypeOrmModule.forFeature([Person])
    ],
    exports: [TypeOrmModule],
})
export class DbModule {
}