import {Controller, Get, Param, Query} from "@nestjs/common";
import {PersonService} from "../services/person.service";
import {Person} from "../../../entities/person.entity";

@Controller("person")
export class PersonController {

    constructor(private readonly personService: PersonService) {
    }

    /**
     * Handles a GET request to retrieve person information.
     * If a valid ID is provided, retrieves the corresponding person.
     * If no valid ID is provided, retrieves all people.
     *
     * @param {string} id (Optional) The ID of the person to retrieve. Should be a positive integer.
     * @returns {Promise<Person[] | Person>} A promise that resolves to:
     *          - A single Person object if a valid ID is provided.
     *          - An array of all Person objects if no valid ID is provided.
     * @throws {HttpException} If the ID is not valid or there is no person with that ID.
     */
    @Get()
    public async getPeople(@Query("id") id?: string): Promise<Person[] | Person> {
        if (id) {
            return this.personService.validateAndFetchPerson(id);
        }
        // no ID provided, return all people
        return this.personService.fetchAllPeople();
    }

    /**
     * Retrieves the maximum borrowable amount for a person based on their ID.
     *
     * The method ensures the person exists and retrieves the maximum amount they can borrow.
     *
     * @param {string} id - The unique identifier of the person whose max borrowable amount is to be retrieved.
     * @returns {Promise<{maxBorrow: number}>} - A promise resolving to the maximum borrowable amount for the
     * specified person.
     * @throws {HttpException} - If the provided ID is invalid or the person does not exist.
     */
    @Get("max_borrow/:id")
    public async getMaxBorrow(@Param("id") id?: string): Promise<{ maxBorrow: number }> {
        // this could also be done by just fetching the whole person and only sending the amount.
        return {maxBorrow: await this.personService.validateAndFetchMaxBorrow(id)};
    }
}