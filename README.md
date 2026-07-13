# Enterprise ERP Management System

A production-ready Enterprise ERP Management System built with React, Node.js, and MongoDB.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express.js, TypeScript, MongoDB, Redis
- **DevOps**: Docker, Nginx, GitHub Actions

## Getting Started

### Prerequisites
- Docker and Docker Compose installed on your machine.

### Running the Application

1. Clone the repository.
2. Ensure you have the required `.env` files (or use the defaults for local development).
3. Run the following command:

```bash
docker compose up --build
```

4. The application will be accessible at:
   - Frontend: `http://localhost`
   - Backend API: `http://localhost/api/v1`

## Project Structure
- `/frontend`: React application
- `/backend`: Node.js API server
- `/nginx`: Nginx reverse proxy configuration
- `/.github`: GitHub Actions CI/CD workflows
- `/docker-compose.yml`: Docker orchestration file
