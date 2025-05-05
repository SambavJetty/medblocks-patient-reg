"use client"

import { useEffect, useState } from "react"
import PatientRegistrationForm from "@/components/patient-registration-form"
import SqlQueryInterface from "@/components/sql-query-interface"
import { initializeDatabase, insertSampleData } from "@/lib/database-simple"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const [isDbInitialized, setIsDbInitialized] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const setupDb = async () => {
      try {
        const db = await initializeDatabase()

        // Check if we need to insert sample data
        const transaction = db.transaction(["patients"], "readonly")
        const store = transaction.objectStore("patients")
        const countRequest = store.count()

        countRequest.onsuccess = async () => {
          if (countRequest.result === 0) {
            await insertSampleData()
          }

          setIsDbInitialized(true)
          toast({
            title: "Database initialized",
            description: "Browser database is ready to use",
          })
        }
      } catch (error) {
        console.error("Failed to initialize database:", error)
        toast({
          title: "Database Error",
          description: "Failed to initialize database",
          variant: "destructive",
        })
      }
    }

    setupDb()
  }, [toast])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto py-8 px-4">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Patient Management System
          </h1>
          <p className="text-gray-600 mt-2">A simple application to manage patient records</p>
        </header>

        {isDbInitialized ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PatientRegistrationForm />
            <SqlQueryInterface />
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Initializing database...</p>
            </div>
          </div>
        )}
      </div>
      <Toaster />
    </main>
  )
}
