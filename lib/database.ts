import initSqlJs from "sql.js"
import { createDbWorker } from "@aphro/absurd-sql/dist/indexeddb-main-thread"

// We'll use a singleton pattern to ensure the same database instance is used across the app
let db: any = null
let worker: any = null

export const initializeDatabase = async () => {
  if (db) return db

  try {
    // Initialize SQL.js with absurd-sql for persistence
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    })

    // Create a database worker for persistence
    worker = createDbWorker(
      [
        {
          url: new URL("https://unpkg.com/@aphro/absurd-sql@0.0.53/dist/sql-wasm.wasm", import.meta.url),
          type: "wasm",
        },
      ],
      () => new Worker(new URL("../workers/sql-worker.js", import.meta.url)),
    )

    // Initialize the database
    db = await worker.db

    // Create patients table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        gender TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        blood_type TEXT NOT NULL,
        registration_date TEXT NOT NULL
      );
    `)

    // Check if we have sample data, if not, insert some
    const result = await executeQuery("SELECT COUNT(*) as count FROM patients;")
    const count = result.rows[0].count

    if (count === 0) {
      // Insert sample data
      await insertSampleData()
    }

    return db
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}

export const executeQuery = async (query: string, params: any[] = []) => {
  if (!db) {
    await initializeDatabase()
  }

  try {
    // Execute the query
    const result = await worker.exec(query, params)
    return { rows: result }
  } catch (error) {
    console.error("Error executing query:", error)
    throw error
  }
}

const insertSampleData = async () => {
  const samplePatients = [
    {
      first_name: "John",
      last_name: "Doe",
      date_of_birth: "1985-05-15",
      gender: "Male",
      phone_number: "555-123-4567",
      email: "john.doe@example.com",
      address: "123 Main St, Anytown, USA",
      blood_type: "O+",
      registration_date: "2023-01-15T10:30:00Z",
    },
    {
      first_name: "Jane",
      last_name: "Smith",
      date_of_birth: "1990-08-22",
      gender: "Female",
      phone_number: "555-987-6543",
      email: "jane.smith@example.com",
      address: "456 Oak Ave, Somewhere, USA",
      blood_type: "A-",
      registration_date: "2023-02-20T14:15:00Z",
    },
    {
      first_name: "Michael",
      last_name: "Johnson",
      date_of_birth: "1978-11-30",
      gender: "Male",
      phone_number: "555-456-7890",
      email: "michael.j@example.com",
      address: "789 Pine Rd, Elsewhere, USA",
      blood_type: "B+",
      registration_date: "2023-03-05T09:45:00Z",
    },
    {
      first_name: "Emily",
      last_name: "Williams",
      date_of_birth: "1995-04-12",
      gender: "Female",
      phone_number: "555-789-0123",
      email: "emily.w@example.com",
      address: "101 Cedar Ln, Nowhere, USA",
      blood_type: "AB+",
      registration_date: "2023-03-10T16:20:00Z",
    },
    {
      first_name: "David",
      last_name: "Brown",
      date_of_birth: "1982-09-08",
      gender: "Male",
      phone_number: "555-234-5678",
      email: "david.b@example.com",
      address: "202 Maple Dr, Anywhere, USA",
      blood_type: "O-",
      registration_date: "2023-03-15T11:10:00Z",
    },
  ]

  for (const patient of samplePatients) {
    await executeQuery(
      `
      INSERT INTO patients (
        first_name, last_name, date_of_birth, gender, 
        phone_number, email, address, blood_type, 
        registration_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
      [
        patient.first_name,
        patient.last_name,
        patient.date_of_birth,
        patient.gender,
        patient.phone_number,
        patient.email,
        patient.address,
        patient.blood_type,
        patient.registration_date,
      ],
    )
  }
}
