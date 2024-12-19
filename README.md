# Backend Application for Bank Data Processing

This project provides a backend solution to process and analyze a large dataset of bank information. It includes APIs to
process user data, compute financial metrics, and calculate borrowing capacities. The application is designed using *
*NestJS**, **TypeORM**, **Docker**, and integrates with tools like **OpenAPI** for documentation.

---

## Assumptions

- The maximum amount one can borrow is the difference between the own net worth and the friend who has the
  highest net worth.

  **Example:**
  If I have 100€, friend A has 120€ and friend B has 150€, the maximum amount I could borrow
  would be 50€.

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
Docker compose can be started with:

``docker-compose up -d``

### Seeding Data
The data with which the postgres database is seeded can be found under ``src/modules/db/seeds/CSV``.

## Testing

1. The application can be tested with any tool that is able to send GET and POST requests.
An openAPI specification can be found in the project root
   under ``bank-and-process-api.yaml``.

   The server is listening to: ``http://localhost:3000/``
2. Mock Data is automatically loaded when the container is set up.
