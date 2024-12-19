import {Seeder} from "typeorm-extension";
import {DataSource} from "typeorm";
import * as csv from "csv-parser";
import * as fs from "fs-extra";
import * as path from "path";

const folderPath = "./src/modules/db/seeds/CSV";

export default class MainSeeder implements Seeder {
    /**
     * Truncates the database and adds fresh data to it.
     *
     * @param dataSource The data source, that is the connection information.
     */
    public async run(dataSource: DataSource): Promise<void> {

        await dataSource.query("TRUNCATE \"person\", \"bank_account\", \"bank_transaction\" RESTART IDENTITY CASCADE;");
        await this.importCsvFiles(folderPath, dataSource);
    }

    /**
     * Parses a CSV file and returns its content as an array of objects.
     *
     * @param {string} filePath - The path to the CSV file to be parsed.
     * @returns {any[]} A promise that resolves with an array of objects representing the CSV rows.
     */
    private async parseCsv(filePath: string): Promise<any[]> {
        const results: any[] = []; // Array to store parsed data

        return new Promise((resolve, reject) => {
            // Create a readable stream from the file at the specified path
            fs.createReadStream(filePath)
              .pipe(
                  csv({
                      separator:  ";", // Specify the separator for the CSV file (semicolon in this case)
                      mapHeaders: ({header}) => header.trim(),
                      mapValues:  ({value}) => value.trim(),
                  }),
              )
              .on("data", (data) => results.push(data)) // Push each parsed row into the results array
              .on("end", () => {
                  resolve(results); // Resolve the promise with the parsed data when the stream ends
              })
              .on("error", (error) => {
                  reject(error); // Reject the promise if an error occurs during parsing
              });
        });
    }

    /**
     * Retrieves a list of CSV files from the specified folder.
     *
     * @param folderPath The path to the folder containing the files.
     * @returns An array of filenames with a .csv extension.
     */
    private getCsvFiles(folderPath: string): string[] {
        const files = fs.readdirSync(folderPath);
        return files.filter(file => path.extname(file) === ".csv");
    }

    /**
     * Generates an SQL `INSERT` query and the corresponding values for a batch of records.
     *
     * @param {any[]} records An array of objects representing the records to be inserted.
     * @param {string} tableName The name of the table where the records will be inserted.
     * @returns An object containing the generated SQL query and the flattened values array.
     */
    private generateInsertQuery(records: any[], tableName: string): { query: string; values: any[] } {
        const columnNames  = Object.keys(records[0]);
        const placeholders = records
            .map((_, rowIndex) =>
                `(${columnNames.map((_, colIndex) => `$${rowIndex * columnNames.length + colIndex + 1}`).join(", ")})`,
            )
            .join(", ");

        const flatValues = records.flatMap(row =>
            Object.values(row).map(value => (value === "NULL" || value === "" ? null : value)),
        );

        const query = `
        INSERT INTO ${tableName} (${columnNames.join(", ")})
        VALUES ${placeholders};
    `;

        return {query, values: flatValues};
    }

    /**
     * Disables foreign key checks in the database for the current session.
     *
     * @param {DataSource} dataSource - The database DataSource object.
     */
    private async disableForeignKeyChecks(dataSource: DataSource): Promise<void> {
        await dataSource.query("SET session_replication_role = replica;");
    }

    /**
     * Re-enables foreign key checks in the database for the current session.
     * This should be called after bulk inserts to restore constraint enforcement.
     *
     * @param {DataSource} dataSource - The database DataSource object.
     */
    private async enableForeignKeyChecks(dataSource: DataSource): Promise<void> {
        await dataSource.query("SET session_replication_role = DEFAULT;");
    }

    /**
     * Inserts records into a specified table in the database.
     * Uses transactions for atomicity and safety.
     *
     * @param {DataSource} dataSource - The database DataSource object.
     * @param {string} tableName - The name of the table where records will be inserted.
     * @param {any[]} records - An array of objects representing the records to be inserted.
     */
    private async insertRecords(dataSource: DataSource, tableName: string, records: any[]): Promise<void> {
        const {query, values} = this.generateInsertQuery(records, tableName);

        await dataSource.transaction(async manager => {
            await manager.query(query, values);
        });
    }

    /**
     * Imports all CSV files from a specified folder into the corresponding database tables.
     * Each CSV file's name is used as the target table name.
     * 
     * @param {string} folderPath - The path to the folder containing the CSV files.
     * @param {DataSource} dataSource - The database DataSource object.
     */
    private async importCsvFiles(folderPath: string, dataSource: DataSource) {
        const csvFiles = this.getCsvFiles(folderPath);

        for (const file of csvFiles) {
            const tableName = path.basename(file, ".csv");
            const filePath  = path.join(folderPath, file);

            // Parse the CSV file
            const records = await this.parseCsv(filePath);

            try {
                // Disable foreign key checks
                await this.disableForeignKeyChecks(dataSource);

                // Insert records into the database
                await this.insertRecords(dataSource, tableName, records);

                console.log(`Successfully parsed ${file} for table ${tableName}`);
            } catch (error) {
                console.error(`Error while importing ${file}:`, error);
            } finally {
                // Re-enable foreign key checks
                await this.enableForeignKeyChecks(dataSource);
            }
        }
    }
}
