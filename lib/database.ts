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
      first_name: "Sample Data",
      last_name: "Doe",
      date_of_birth: "1985-05-15",
      gender: "Male",
      phone_number: "555-123-4567",
      email: "john.doe@example.com",
      address: "123 Main St, Anytown, USA",
      blood_type: "O+",
      registration_date: "2023-01-15T10:30:00Z",
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
