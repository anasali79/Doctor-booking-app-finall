"use client"

import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Search, Phone, Mail, Calendar, ArrowLeft, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PatientsPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Sample patient data - replace with real API call
  const patients = [
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      lastVisit: "2024-01-15",
      totalAppointments: 5,
      status: "Active",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1 (555) 987-6543",
      lastVisit: "2024-01-10",
      totalAppointments: 3,
      status: "Active",
    },
  ]

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="mr-4 border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Patient Records
              </h1>
              <p className="text-slate-400 text-lg mt-2">Manage your patient information</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search patients..."
              className="pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-teal-500/50"
            />
          </div>

          {/* Patients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient, index) => (
              <Card
                key={patient.id}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      {patient.name}
                    </CardTitle>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">{patient.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-slate-300 text-sm">
                    <Mail className="w-4 h-4" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300 text-sm">
                    <Phone className="w-4 h-4" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Last visit: {patient.lastVisit}</span>
                  </div>
                  <div className="pt-3">
                    <Button size="sm" className="w-full bg-teal-500 hover:bg-teal-600">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <Card className="mt-8 border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Full Patient Management Coming Soon</h3>
              <p className="text-slate-400">
                Advanced patient records, medical history, and detailed analytics will be available soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
