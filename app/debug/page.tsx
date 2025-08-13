"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function DebugPage() {
  const [serverStatus, setServerStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [doctors, setDoctors] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [error, setError] = useState<string>("")

  const checkConnection = async () => {
    setServerStatus("checking")
    setError("")

    try {
      // Test doctors endpoint
      const doctorsResponse = await fetch("https://doctor-api-u6mn.onrender.com/doctors")
      if (!doctorsResponse.ok) {
        throw new Error(`Doctors endpoint failed: ${doctorsResponse.status}`)
      }
      const doctorsData = await doctorsResponse.json()
      setDoctors(doctorsData)

      // Test patients endpoint
            const patientsResponse = await fetch("https://doctor-api-u6mn.onrender.com/patients")
      if (!patientsResponse.ok) {
        throw new Error(`Patients endpoint failed: ${patientsResponse.status}`)
      }
      const patientsData = await patientsResponse.json()
      setPatients(patientsData)

      setServerStatus("connected")
    } catch (err) {
      setServerStatus("disconnected")
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Debug Page</h1>

        {/* Server Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {serverStatus === "checking" && <Loader2 className="w-5 h-5 animate-spin" />}
              {serverStatus === "connected" && <CheckCircle className="w-5 h-5 text-green-600" />}
              {serverStatus === "disconnected" && <XCircle className="w-5 h-5 text-red-600" />}
              <span>Server Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p
                className={`font-medium ${
                  serverStatus === "connected"
                    ? "text-green-600"
                    : serverStatus === "disconnected"
                      ? "text-red-600"
                      : "text-yellow-600"
                }`}
              >
                Status: {serverStatus.toUpperCase()}
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">Error:</p>
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <Button onClick={checkConnection} disabled={serverStatus === "checking"}>
                {serverStatus === "checking" ? "Checking..." : "Recheck Connection"}
              </Button>

              {serverStatus === "disconnected" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-medium">To fix this issue:</p>
                  <ol className="text-yellow-700 mt-2 space-y-1 list-decimal list-inside">
                    <li>Open a new terminal</li>
                    <li>Navigate to your project directory</li>
                    <li>
                      Run: <code className="bg-yellow-200 px-2 py-1 rounded">npm run json-server</code>
                    </li>
                    <li>Wait for "JSON Server is running on port 3001"</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Doctors Data */}
        {serverStatus === "connected" && (
          <Card>
            <CardHeader>
              <CardTitle>Doctors ({doctors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{doctor.name}</p>
                      <p className="text-sm text-gray-600">{doctor.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600">{doctor.specialty}</p>
                      <p className="text-xs text-gray-500">ID: {doctor.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patients Data */}
        {serverStatus === "connected" && (
          <Card>
            <CardHeader>
              <CardTitle>Patients ({patients.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patients.map((patient) => (
                  <div key={patient.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">ID: {patient.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Login */}
        {serverStatus === "connected" && (
          <Card>
            <CardHeader>
              <CardTitle>Test Login Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Doctor Login</h4>
                  <p className="text-sm text-blue-700">Email: sarah@example.com</p>
                  <p className="text-sm text-blue-700">Password: password123</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Patient Login</h4>
                  <p className="text-sm text-green-700">Email: john@example.com</p>
                  <p className="text-sm text-green-700">Password: password123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
