import {Seeder} from "typeorm-extension";
import {DataSource} from "typeorm";
import * as csv from "csv-parser";
import * as fs from "fs-extra";
import * as path from "path";

async function parseCsv(filePath: string): Promise<any[]> {
    const results: any[] = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(
              csv({
                  separator:  ";",
                  mapHeaders: ({header}) => header.trim(), // Trim each header
                  mapValues:  ({value}) => value.trim(), // Trim each field
              }),
          )
          .on("data", (data) => results.push(data))
          .on("end", () => {
              resolve(results);
          })
          .on("error", (error) => {
              reject(error);
          });
    });
}

async function importCsvFiles(folderPath: string, dataSource: DataSource) {
    const files = fs.readdirSync(folderPath);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (path.extname(file) === ".csv") {
            const tableName = path.basename(file, ".csv");
            const filePath  = path.join(folderPath, file);

            // Read and parse the CSV file
            const records = await parseCsv(filePath);

            try {
                // Disable foreign key checks
                await dataSource.query("SET session_replication_role = replica;");

                await dataSource.transaction(async (manager) => {
                    const columnNames  = Object.keys(records[0]);
                    const placeholders = records
                        .map((_, rowIndex) =>
                            `(${columnNames.map((_, colIndex) => `$${rowIndex * columnNames.length + colIndex + 1}`)
                                           .join(", ")})`,
                        )
                        .join(", ");

                    const flatValues = records.flatMap((row) =>
                        Object.values(row).map((value) => (value === "NULL" || value === "" ? null : value)),
                    );

                    const query = `
                        INSERT INTO ${tableName} (${columnNames.join(", ")})
                        VALUES ${placeholders};
                    `;

                    await manager.query(query, flatValues);
                });

                console.log(`Successfully parsed ${file} for table ${tableName}`);
            } catch (error) {
                console.error(`Error while importing ${file}:`, error);
            } finally {
                // Re-enable foreign key checks
                await dataSource.query("SET session_replication_role = DEFAULT;");
            }
        }
    }
}


// Example usage:
const folderPath = "./src/modules/db/seeds/CSV";

export default class MainSeeder implements Seeder {
    /**
     * Truncates the database and adds fresh data to it.
     * @param dataSource The data source, that is the connection information.
     */
    public async run(dataSource: DataSource): Promise<void> {

        await dataSource.query("TRUNCATE \"person\", \"bank_account\", \"bank_transaction\" RESTART IDENTITY CASCADE;");
        await importCsvFiles(folderPath, dataSource);
    }
}
