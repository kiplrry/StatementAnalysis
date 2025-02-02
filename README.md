# Statement Analysis

This project is an implementation of a **Statement Analysis** tool. Currently, it supports analyzing **Mpesa statements**. The application is still a work in progress, with ongoing efforts in testing, validation, and TypeScript (TSX) errors.

---



## Development Instructions

### Prerequisites

- **Server Requirements**:
  - **Java**: Version 8 or later (required for Tabula)
  - **Python**: Version 3.10 or later
- **Message Broker and Result Backend**:
  - Not a must, but you'll have to tweak the flask api code do analysis without a broker
  - Example: Redis, AMQP (required for Celery)

---

Clone the project

### Backend (FastAPI Server)

1. Navigate to the `FastApiServer` directory:
   ```bash
   cd FastApiServer
   ```

2. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

---

### Celery Worker

This is not a must, you can tweak the fastapi code to run the task asynchronously. only necessarry for many statements.

The Celery worker is used to handle background tasks. 

1. Ensure you have a **message broker** and a **result backend** set up (e.g., Redis or AMQP).

2. Create an `.env` file in the `FastApiServer` directory for your environment variables.

3. Start the Celery worker:
   ```bash
   celery -A worker --loglevel=INFO
   ```

---

### Frontend (React)

1. Navigate to the `ReactFrontEnd` directory:
   ```bash
   cd ReactFrontEnd
   ```

2. Install the required Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

---

## Running with Docker

1. Check the `docker-compose.yml` file to confirm the port mappings.

2. Ensure the `.env` file is present in the `FastApiServer` directory.

3. Start the application with Docker Compose:
   ```bash
   docker-compose up
   ```

---

## Notes
-- **The app takes approx 0.5s per pdf page to extract data**

- **Testing and Validation**: The application is still undergoing development, and testing/validation features are being actively worked on.
- **TypeScript (TSX)**: TypeScript integration is a work in progress for the frontend.

Feel free to contribute or raise issues for improvements!