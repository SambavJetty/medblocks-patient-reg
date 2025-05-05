// This is a simplified version of the database that uses IndexedDB directly
// We'll use this as a fallback if the SQL.js approach doesn't work

interface PatientRecord {
  id?: number
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  phoneNumber: string
  email: string
  address: string
  bloodType: string
  registrationDate: string
}

// Create a simple IndexedDB database
let db: IDBDatabase | null = null

export const initializeDatabase = async () => {
  if (db) return db

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("PatientDatabase", 1)

    request.onerror = (event) => {
      console.error("Error opening database:", event)
      reject(new Error("Failed to open database"))
    }

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create patients object store
      const store = db.createObjectStore("patients", { keyPath: "id", autoIncrement: true })

      // Create indexes for searching
      store.createIndex("lastName", "lastName", { unique: false })
      store.createIndex("bloodType", "bloodType", { unique: false })
      store.createIndex("gender", "gender", { unique: false })
    }
  })
}

export const executeQuery = async (query: string, params: any[] = []) => {
  if (!db) {
    await initializeDatabase()
  }

  // Parse the query (very simplified SQL parser)
  query = query.trim().toLowerCase()

  // SELECT queries
  if (query.startsWith("select")) {
    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(["patients"], "readonly")
      const store = transaction.objectStore("patients")
      const request = store.getAll()

      request.onsuccess = () => {
        let results = request.result

        // Handle WHERE clauses (very basic implementation)
        if (query.includes("where")) {
          const whereClause = query.split("where")[1].split("limit")[0].trim()

          // Handle basic equality conditions
          if (whereClause.includes("blood_type") || whereClause.includes("bloodtype")) {
            const bloodType = whereClause.match(/'([^']+)'/) || whereClause.match(/"([^"]+)"/)
            if (bloodType && bloodType[1]) {
              results = results.filter((patient: any) => patient.bloodType === bloodType[1])
            }
          } else if (whereClause.includes("gender")) {
            const gender = whereClause.match(/'([^']+)'/) || whereClause.match(/"([^"]+)"/)
            if (gender && gender[1]) {
              results = results.filter((patient: any) => patient.gender === gender[1])
            }
          }
        }

        // Handle LIMIT clause
        if (query.includes("limit")) {
          const limitMatch = query.match(/limit\s+(\d+)/i)
          if (limitMatch && limitMatch[1]) {
            const limit = Number.parseInt(limitMatch[1], 10)
            results = results.slice(0, limit)
          }
        }

        resolve({ rows: results })
      }

      request.onerror = (event) => {
        reject(new Error("Error executing query"))
      }
    })
  }

  // INSERT queries
  if (query.startsWith("insert")) {
    // For simplicity, we'll handle inserts directly in the form submission
    return { rows: [{ message: "Use the registration form to insert new patients" }] }
  }

  return { rows: [] }
}

export const addPatient = async (patient: PatientRecord) => {
  if (!db) {
    await initializeDatabase()
  }

  return new Promise<number>((resolve, reject) => {
    const transaction = db!.transaction(["patients"], "readwrite")
    const store = transaction.objectStore("patients")
    const request = store.add(patient)

    request.onsuccess = () => {
      resolve(request.result as number)
    }

    request.onerror = () => {
      reject(new Error("Failed to add patient"))
    }
  })
}

// Insert sample data
export const insertSampleData = async () => {
  const samplePatients: PatientRecord[] = [
    {
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1985-05-15",
      gender: "Male",
      phoneNumber: "555-123-4567",
      email: "john.doe@example.com",
      address: "123 Main St, Anytown, USA",
      bloodType: "O+",
      registrationDate: "2023-01-15T10:30:00Z",
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      dateOfBirth: "1990-08-22",
      gender: "Female",
      phoneNumber: "555-987-6543",
      email: "jane.smith@example.com",
      address: "456 Oak Ave, Somewhere, USA",
      bloodType: "A-",
      registrationDate: "2023-02-20T14:15:00Z",
    },
    {
      firstName: "Michael",
      lastName: "Johnson",
      dateOfBirth: "1978-11-30",
      gender: "Male",
      phoneNumber: "555-456-7890",
      email: "michael.j@example.com",
      address: "789 Pine Rd, Elsewhere, USA",
      bloodType: "B+",
      registrationDate: "2023-03-05T09:45:00Z",
    },
    {
      firstName: "Emily",
      lastName: "Williams",
      dateOfBirth: "1995-04-12",
      gender: "Female",
      phoneNumber: "555-789-0123",
      email: "emily.w@example.com",
      address: "101 Cedar Ln, Nowhere, USA",
      bloodType: "AB+",
      registrationDate: "2023-03-10T16:20:00Z",
    },
    {
      firstName: "David",
      lastName: "Brown",
      dateOfBirth: "1982-09-08",
      gender: "Male",
      phoneNumber: "555-234-5678",
      email: "david.b@example.com",
      address: "202 Maple Dr, Anywhere, USA",
      bloodType: "O-",
      registrationDate: "2023-03-15T11:10:00Z",
    },
  ]

  for (const patient of samplePatients) {
    await addPatient(patient)
  }
}
