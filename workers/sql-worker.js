import { SQLiteFS } from "@aphro/absurd-sql"
import { IndexedDBBackend } from "@aphro/absurd-sql/dist/indexeddb-backend"

// This is a Web Worker that runs SQL.js with absurd-sql for persistence
self.addEventListener("message", (event) => {
  const { id, action, args } = event.data

  if (action === "init") {
    // Initialize SQL.js with absurd-sql
    const { SQL } = args
    const sqlFS = new SQLiteFS(SQL.FS, new IndexedDBBackend())
    SQL.register_for_idb(sqlFS)

    SQL.FS.mkdir("/sql")
    SQL.FS.mount(sqlFS, {}, "/sql")

    const db = new SQL.Database("/sql/patients.db")
    self.db = db

    self.postMessage({ id, result: "Database initialized" })
  } else if (action === "exec") {
    // Execute a SQL query
    const { sql, params } = args
    try {
      const result = self.db.exec(sql, params)
      self.postMessage({ id, result })
    } catch (error) {
      self.postMessage({ id, error: error.message })
    }
  } else if (action === "close") {
    // Close the database
    self.db.close()
    self.postMessage({ id, result: "Database closed" })
  }
})
