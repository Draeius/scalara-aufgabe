# Backend Application for Bank Data Processing

This project provides a backend solution to process and analyze a large dataset of bank information. It includes APIs to
process user data, compute financial metrics, and calculate borrowing capacities. The application is designed using 
**NestJS**, **TypeORM**, **Docker**, and has an **OpenAPI** documentation for the endpoints.

---

## Assumptions

- The maximum amount one can borrow is the difference between the own net worth and the friend who has the
  highest net worth.

  **Example:**
  If I have 100€, friend A has 120€ and friend B has 150€, the maximum amount I could borrow
  would be 50€.
- There are other transactions outside of borrowing. The task defined lending but did not exclude transactions outside
  of lending.
- As each transaction is related to an account, it is possible to send money to outside sources, but not to get money
  from outside.

## Edge Cases

- External IBANs
  As the IBAN the transaction is going to is not specified as relation, it is only a string. As such it is possible
  to have external IBANs. The server handles this by hinting it in the console and only processing the sender side.
- Sending money to the same IBAN it is coming from
  The server will skip transactions to the same account.
- Two friends both have a negative net worth
  This will work, two friends with negative net worth can lend each other money. Transactions will be processed regardless.

---

## Features

1. **Webhook Endpoint**:
    - Receives `process_id` via HTTP POST request.
    - Executes the corresponding processes based on the `process_id` in sequential order:
        - Process 1: Calculate new account balances.
        - Process 2: Compute the net worth of each person.
        - Process 3: Calculate the maximum amount a person can borrow from their friends.

2. **Data Query Endpoints**:
    - Retrieve person, bank account and transaction details.

3. **Borrowing Calculation Endpoint**:
    - Accepts a person ID and returns the maximum amount they can borrow from friends based on their balances.

4. **Mock Data Setup**:
    - Mock datasets for persons, bank accounts, and transactions for testing purposes.

---

## Tech Stack

- **NestJS**: Framework for building the application.
- **TypeORM**: ORM for managing database entities and queries.
- **Docker**: Containerized setup for the backend and database services.
- **OpenAPI**: API documentation.
- **PostgreSQL**: Relational database for managing structured data.
- **Yarn**: Package management.

---

## Installation and Setup

The deployment is done with docker-compose. It will pull a postgres image and run it,
seed it with data and set up the server.

### Docker Compose
Assuming Docker is installed and running, docker compose can be started with:

``docker-compose up``

This may take a while. If it is done you will see the server setting up the routes.

### Seeding Data
The data with which the postgres database is seeded can be found under ``src/modules/db/seeds/CSV``.

## Testing

1. The application can be tested with any tool that is able to send GET and POST requests.
An OpenAPI specification can be found in the project root under ``bank-and-process-api.yaml``.

   The server is listening to: ``http://localhost:3000/``
2. Mock Data is automatically loaded when the container is set up.
3. Direct database access is possible under port ``5432`` with username **postgres** and password **tsRV764S08sd**
