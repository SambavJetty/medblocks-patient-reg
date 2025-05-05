"use client"

import type React from "react"

import { useState } from "react"
import { executeQuery } from "@/lib/database-simple"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function SqlQueryInterface() {
  const { toast } = useToast()
  const [query, setQuery] = useState("SELECT * FROM patients LIMIT 10;")
  const [results, setResults] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value)
  }

  const runQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a SQL query",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await executeQuery(query)

      if (result && result.rows) {
        setResults(result.rows)

        // Extract column names from the first row
        if (result.rows.length > 0) {
          setColumns(Object.keys(result.rows[0]))
        } else {
          setColumns([])
        }

        toast({
          title: "Query Executed",
          description: `Retrieved ${result.rows.length} records`,
        })
      } else {
        setResults([])
        setColumns([])
        toast({
          title: "Query Executed",
          description: "No results returned",
        })
      }
    } catch (error) {
      console.error("Error executing query:", error)
      toast({
        title: "Query Error",
        description: String(error),
        variant: "destructive",
      })
      setResults([])
      setColumns([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery)
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
        <CardTitle className="text-xl">SQL Query Interface</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Textarea
              value={query}
              onChange={handleQueryChange}
              className="font-mono h-32 border-purple-200 focus:border-purple-500"
              placeholder="Enter your SQL query here..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={runQuery}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              {isLoading ? "Running..." : "Run Query"}
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExampleQuery("SELECT * FROM patients LIMIT 10;")}
              className="text-purple-600 border-purple-300"
            >
              Show All Patients
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExampleQuery("SELECT * FROM patients WHERE blood_type = 'O+' LIMIT 10;")}
              className="text-purple-600 border-purple-300"
            >
              O+ Patients
            </Button>
          </div>

          <div className="mt-4">
            <h3 className="font-medium text-gray-700 mb-2">Results:</h3>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-100 to-blue-100">
                      {columns.map((column, index) => (
                        <th
                          key={index}
                          className="border border-purple-200 px-3 py-2 text-left text-sm font-medium text-gray-700"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-purple-50"}>
                        {columns.map((column, colIndex) => (
                          <td key={colIndex} className="border border-purple-200 px-3 py-2 text-sm text-gray-700">
                            {row[column] !== null ? String(row[column]) : "NULL"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No results to display</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
