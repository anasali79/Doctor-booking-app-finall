"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Search, Phone, Mail, Calendar, ArrowLeft, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { appointmentsAPI, patientsAPI, type Appointment, type Patient } from "@/lib/api"
import { format, parseISO } from "date-fns"

export default function PatientsPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [doctorAppointments, setDoctorAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState("")

  useEffect(() => {
    const load = async () => {
      if (!user) return
      setIsLoading(true)
      try {
        const [patients, appointments] = await Promise.all([
          patientsAPI.getAll(),
          appointmentsAPI.getByDoctorId(user.id),
        ])
        setAllPatients(patients)
        setDoctorAppointments(appointments)
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [user])

  const patientStats = useMemo(() => {
    const map: Record<string, { lastVisit?: string; total: number }> = {}
    doctorAppointments.forEach((apt) => {
      const current = map[apt.patientId] || { total: 0 }
      current.total += 1
      try {
        const d = parseISO(apt.date)
        const last = current.lastVisit ? parseISO(current.lastVisit) : null
        if (!last || d.getTime() > last.getTime()) current.lastVisit = apt.date
      } catch {
        // ignore invalid
      }
      map[apt.patientId] = current
    })
    return map
  }, [doctorAppointments])

  const patientsForThisDoctor = useMemo(() => {
    const ids = new Set(doctorAppointments.map((a) => a.patientId))
    const onlyRelevant = allPatients.filter((p) => ids.has(p.id))
    const withComputed = onlyRelevant.map((p) => {
      const stats = patientStats[p.id] || { total: 0 }
      return {
        ...p,
        lastVisit: stats.lastVisit,
        totalAppointments: stats.total,
        status: "Active" as const,
      }
    })
    if (!searchText) return withComputed
    const q = searchText.toLowerCase()
    return withComputed.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.phone || "").toLowerCase().includes(q),
    )
  }, [allPatients, doctorAppointments, patientStats, searchText])

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
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-teal-500/50"
            />
          </div>

          {/* Patients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse bg-slate-800/50">
                  <CardHeader>
                    <div className="h-6 bg-slate-700 rounded w-3/4" />
                    <div className="h-4 bg-slate-700 rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-slate-700 rounded" />
                  </CardContent>
                </Card>
              ))
            ) : patientsForThisDoctor.length === 0 ? (
              <Card className="col-span-full border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80">
                <CardContent className="p-8 text-center text-slate-300">No patients found.</CardContent>
              </Card>
            ) : (
            patientsForThisDoctor.map((patient: any, index) => (
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
                    <span>
                      Last visit: {patient.lastVisit ? format(parseISO(patient.lastVisit), "dd MMM yyyy") : "—"}
                    </span>
                  </div>
                  <div className="pt-3 grid grid-cols-2 gap-2">
                    <Button size="sm" className="w-full bg-teal-500 hover:bg-teal-600">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Link href={`/doctor/patients/${patient.id}/history`}>
                      <Button size="sm" variant="outline" className="w-full border-slate-600 text-slate-300 bg-transparent">
                        Medical History
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
            )}
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
