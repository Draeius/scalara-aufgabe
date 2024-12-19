import {HttpException, Injectable} from "@nestjs/common";
import {EntityManager, Repository} from "typeorm";
import {Person} from "../../../entities/person.entity";
import {BankAccount} from "../../../entities/bank-account.entity";
import {ValidationUtil} from "../../../utils/validation.util";

@Injectable()
export class PersonService {

    private personRepository: Repository<Person>;

    public constructor(entityManager: EntityManager) {
        this.personRepository = entityManager.getRepository(Person);
    }

    /**
     * Validates the person ID and fetches the maximum amount he or she can borrow.
     *
     * @param {string} personId The person's ID
     * @returns {number} The maximum amount the person can borrow.
     * @throws {HttpException} If the person does not exist or the ID is not valid.
     */
    public async validateAndFetchMaxBorrow(personId: string): Promise<number> {
        // Implemented extra method for this, as we would fetch the whole person otherwise.
        // This way we are reducing database load.
        const id     = ValidationUtil.parseID(personId);
        const person = await this.personRepository.findOne({
            select: {maxBorrow: true},
            where:  {id},
        });
        if (!person) {
            throw new HttpException(`Person not found. ID: ${personId}`, 422);
        }
        return person.maxBorrow;
    }

    /**
     * Validates the provided person ID and fetches the corresponding entity if present in the database.
     *
     * @param {string} personId The person ID to check
     * @returns {Promise<Person>} The person corresponding to the ID, if there is any.
     * @throws {HttpException} If the provided ID is invalid or there is no person with that ID.
     */
    public async validateAndFetchPerson(personId: string): Promise<Person> {
        const id     = ValidationUtil.parseID(personId);
        const person = await this.fetchPerson(id);
        if (!person) {
            throw new HttpException(`Person not found. ID: ${personId}`, 422);
        }
        return person;
    }

    /**
     * Fetches all people from the database together with their bank accounts and friends.
     *
     * @returns {Promise<Person[]>} All people in the database.
     */
    public async fetchAllPeopleWithFriends(): Promise<Person[]> {
        return this.personRepository.find({
            relations: {
                bankAccounts: true,
                hasFriend:    {bankAccounts: true},
                friendOf:     {bankAccounts: true},
            },
        });
    }

    /**
     * Fetches all people from the database.
     *
     * @returns {Promise<Person[]>} All people in the database.
     */
    public async fetchAllPeople(): Promise<Person[]> {
        return this.personRepository.find();
    }

    /**
     * Fetches a single person by ID from the database.
     *
     * @returns {Promise<Person[] | null>} The person with the given ID or null if there is none.
     */
    public async fetchPerson(id: number): Promise<Person | null> {
        return this.personRepository.findOneBy({id});
    }


    /**
     * Recalculates and updates every persons net worth in the database.
     */
    public async processNetWorth(): Promise<void> {
        const people = await this.fetchAllPeopleWithFriends();
        for (const person of people) {
            person.netWorth = this.calculateNetWorth(person);
        }
        await this.personRepository.save(people);
    }

    /**
     * Recalculates and updates the maximum amount that each person can borrow from their friends.
     * The result is a minimum of 0. That implies it is not possible to borrow negative amounts from your friends.
     */
    public async processMaxBorrow(): Promise<void> {
        const people = await this.fetchAllPeopleWithFriends();
        for (const person of people) {
            const netWorth = this.calculateNetWorth(person); // calc net worth of person

            // assuming friend relationships go both ways.
            const friends    = [...person.hasFriend, ...person.friendOf];
            // calc net worth of all friends and get the maximum difference
            person.maxBorrow = Math.max(...friends.map(friend => this.calculateNetWorth(friend) - netWorth), 0);
        }
        await this.personRepository.save(people);
    }

    /**
     * Calculates the net worth of a person. That is to say it adds all bank accounts.
     *
     * @param {Person} person The person to calculate the net worth for.
     * @returns {number} The net worth of the given Person.
     * @private
     */
    private calculateNetWorth(person: Person): number {
        return Math.max(person.bankAccounts.reduce((netWorth: number, account: BankAccount) => {
            return netWorth + account.balance;
        }, 0), 0);
    }
}