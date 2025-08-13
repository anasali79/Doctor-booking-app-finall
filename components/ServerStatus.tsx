"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"

export function ServerStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking")

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch("https://doctor-api-u6mn.onrender.com/doctors", {
          method: "HEAD",
          signal: AbortSignal.timeout(5000), // 5 second timeout
        })
        setStatus(response.ok ? "connected" : "disconnected")
      } catch (error) {
        setStatus("disconnected")
      }
    }

    checkServer()
    const interval = setInterval(checkServer, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [])

  if (status === "connected") {
    return null // Don't show anything when connected
  }

  return (
    <Card
      className={`mb-4 ${status === "disconnected" ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          {status === "checking" ? (
            <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <div>
            <p className={`font-medium ${status === "checking" ? "text-yellow-800" : "text-red-800"}`}>
              {status === "checking" ? "Checking server connection..." : "Server not connected"}
            </p>
            {status === "disconnected" && (
              <p className="text-sm text-red-700 mt-1">
                Please run <code className="bg-red-200 px-2 py-1 rounded text-red-900">npm run json-server</code> in a
                separate terminal
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
