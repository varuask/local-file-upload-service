# local file upload and async processing service

This microservice handles user authentication, file uploads, and file processing with a worker queue.

---

## How to Run the Project

1. Clone the repo

```bash
git clone https://github.com/varuask/local-file-upload-service.git
cd local-file-upload-service
```

2.  Install dependencies

```bash
npm install
```

3.  Create `.env` file based on `.env.example` and fill in your config.
4.  Start the server

```bash
npm run start
```

5.  Start the worker

```bash
npm run worker
```

---

## Database Schema

This service uses PostgreSQL and defines two main tables: `users` and `files`.

---

### users Table

Stores user credentials and creation timestamp.

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```

- `email` is unique and required.
- `password` is securely hashed using `bcrypt` before insertion into the database.
- `created_at` records the timestamp of user creation.

---

### files Table

Tracks file uploads, status, and metadata.

```sql
CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  original_filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50) CHECK (status IN ('uploaded', 'processing', 'processed', 'failed')) NOT NULL DEFAULT 'uploaded',
  extracted_data TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

```

- Each file is linked to a user via `user_id`.
- `original_filename` and `stored_filename` track the input and internal filenames.
- `status` reflects the file's processing lifecycle (`uploaded`, `processing`, `processed`, `failed`).
- `title` and `description` are optional metadata fields.
- `extracted_data` can store any processed content from the file.
- `uploaded_at` and `updated_at` manage file lifecycle tracking.

**Note:** For the demo , I have hosted a postgres db on cloud, the details for the same are in postman documentation overview section. I have created 2 users , the details for the same can be found in postman documentation.

---

## Saved File Directory Structure

Each uploaded file is saved on disk using the format:

uploads/{userId}/{fileName}

This directory structure is designed to:

- Avoid filename collisions between users.
- Maintain clear segregation and organization of files by user.

---

## API Endpoints

- `POST /auth/login` — login with email and password
- `POST /file/upload` — upload a file with optional title & description
- `GET /file/:id` — get file info by ID
- `GET /file?page=1` — list files with pagination support

**Note:** Different examples for these can be found on the postman collection.

---

## API Endpoints

- `POST /auth/login` — Login with email and password

  - **Inputs**: `email` and `password` (both are required)
  - **Returns**: A JWT token if credentials are valid
  - **Token Info**: Contains the user's `id` and is valid for 15 days (controlled by environment variables)

- `POST /file/upload` — Upload a file with optional title & description (Authenticated)

  - **Inputs**:
    - `file` (required)
    - `title`, `description` (optional)
  - **File Restrictions**: Max size = 10MB, no restriction on file type
  - **Process Flow**: Performs all three operations:
    1. Uploads file
    2. Updates metadata (title/description)
    3. Adds a processing task to the queue

- `GET /file/:id` — Get file info by ID (Authenticated)

  - **Inputs**: `id` as a route parameter
  - **Access Control**: Only accessible by the user who uploaded the file
  - **Returns**: Metadata and processing status of the file

- `GET /file?page=1` — List files with pagination support (Authenticated)
  - **Inputs**: Optional `page` query param
  - **Defaults**: If not provided, defaults to `page=1`
  - **Pagination**: Returns a maximum of 10 files per page

---

**Note:** Example requests and responses for each endpoint can be found in the Postman collection.

## Worker Process

This microservice uses a background worker to process uploaded files asynchronously using BullMQ .The worker is responsible for reading and extracting data from `.txt` files and updating their status in the database.

### Queue Name

- `file-processing`

### Responsibilities

- Listens for incoming jobs from the `file-processing` queue.
- Validates `fileId` and `storagePath` before processing.
- Supports `.txt` files only for processing.
- Reads content from the `.txt` file and saves the extracted content to the `extracted_data` column.
- Updates the file status to:
  - `processed` upon successful processing.
  - `failed` if:
    - Invalid data is passed.
    - File extension is unsupported.
    - File processing encounters an error.

### Logs & Events

- Logs job data when received.
- Logs custom messages for:
  - Invalid job data
  - Unsupported file types
  - Successful file processing
  - Failures and exceptions
- Emits and handles the following BullMQ worker events:
  - `error`: Log unexpected worker errors
  - `failed`: Log failure reason for a specific job
  - `active`: Log when a job starts processing
  - `completed`: Log successful completion of a job
  - `ready`: Confirms worker has connected to Redis

### Retry Mechanism

For `.txt` files, the system includes a retry mechanism to handle temporary failures during processing. If a job fails, it will automatically retry **up to 3 times** using an **exponential backoff strategy** .

---

**Note:** Only `.txt` files are currently supported for processing. All other file types are marked as failed with a descriptive message.

---
