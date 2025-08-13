"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { appointmentsAPI, prescriptionsAPI, patientsAPI, doctorsAPI, type Appointment, type Prescription, type Patient, type Doctor } from "@/lib/api"
import { CalendarIcon, Clock, User, CheckCircle, XCircle, Filter, Search, Phone, Mail, Edit, X, Video, Building, FileText, Eye } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"

import DoctorCalendarView from "@/components/doctor-calendar-view"
import { PrescriptionForm } from "@/components/PrescriptionForm"
import { PrescriptionDetailView } from "@/components/PrescriptionDetailView"



export default function DoctorAppointmentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState(searchParams?.get("filter") || "all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [isRescheduling, setIsRescheduling] = useState(false)

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("all")

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")

  // State for Prescription Form Dialog
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false)
  const [appointmentToPrescribe, setAppointmentToPrescribe] = useState<Appointment | null>(null)

  // State for Prescription Detail View Dialog
  const [showPrescriptionDetailDialog, setShowPrescriptionDetailDialog] = useState(false)
  const [selectedPrescriptionForView, setSelectedPrescriptionForView] = useState<Prescription | null>(null)

  useEffect(() => {
    if (user) {
      loadAppointmentsAndRelatedData()
    }
  }, [user])

  useEffect(() => {
    if (viewMode === "list") {
      filterAppointments()
    } else {
      setFilteredAppointments(appointments)
    }
  }, [appointments, searchTerm, statusFilter, selectedDate, selectedTimeSlot, viewMode])

  const loadAppointmentsAndRelatedData = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const [appointmentsData, patientsData, doctorsData] = await Promise.all([
        appointmentsAPI.getByDoctorId(user.id),
        patientsAPI.getAll(),
        doctorsAPI.getAll(),
      ])
      setAppointments(appointmentsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
      setPatients(patientsData)
      setDoctors(doctorsData)
      console.log("Appointments, Patients, Doctors loaded.")
    } catch (error) {
      console.error("Failed to load data:", error)
      toast({
        title: "Error",
        description: "Failed to load appointments or related data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAppointments = () => {
    let currentFiltered = appointments
    if (selectedDate) {
      const selectedDateString = format(selectedDate, "yyyy-MM-dd")
      currentFiltered = currentFiltered.filter((apt) => apt.date === selectedDateString)
    }
    if (selectedTimeSlot !== "all") {
      currentFiltered = currentFiltered.filter((apt) => {
        const [hours, minutes] = apt.time.split(":").map(Number)
        const totalMinutes = hours * 60 + minutes
        if (selectedTimeSlot === "morning") {
          return totalMinutes >= 9 * 60 && totalMinutes < 12 * 60
        } else if (selectedTimeSlot === "afternoon") {
          return totalMinutes >= 12 * 60 && totalMinutes < 17 * 60
        } else if (selectedTimeSlot === "evening") {
          return totalMinutes >= 17 * 60 && totalMinutes < 22 * 60
        }
        return true
      })
    }
    if (searchTerm) {
      currentFiltered = currentFiltered.filter((apt) =>
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (statusFilter !== "all") {
      currentFiltered = currentFiltered.filter((apt) => apt.status === statusFilter)
    }
    setFilteredAppointments(currentFiltered)
  }

  const handleReschedule = async (appointmentId: string, newDate: string, newTime: string) => {
    setIsRescheduling(true)
    console.log("Calling appointmentsAPI.reschedule with:", { appointmentId, newDate, newTime })
    try {
      await appointmentsAPI.reschedule(appointmentId, newDate, newTime)
      await loadAppointmentsAndRelatedData()
      toast({
        title: "Success",
        description: "Appointment rescheduled successfully!",
      })
      setSelectedAppointment(null)
      setRescheduleDate("")
      setRescheduleTime("")
    } catch (error) {
      console.error("Error rescheduling appointment via API:", error)
      toast({
        title: "Error",
        description: "Failed to reschedule appointment. Please check your network and API.",
        variant: "destructive",
      })
    } finally {
      setIsRescheduling(false)
    }
  }

  const handlePrescriptionSuccess = async (prescription) => {
    if (!appointmentToPrescribe || !user) return

    try {
      await appointmentsAPI.updateStatus(appointmentToPrescribe.id, "completed", prescription.id)
      toast({
        title: "Success",
        description: "Prescription saved and appointment marked as completed!",
      })
      setShowPrescriptionDialog(false)
      setAppointmentToPrescribe(null)
      await loadAppointmentsAndRelatedData()
    } catch (error) {
      console.error("Error linking prescription to appointment:", error)
      toast({
        title: "Error",
        description: "Failed to link prescription to appointment.",
        variant: "destructive",
      })
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, status: Appointment["status"]) => {
    console.log("Calling appointmentsAPI.updateStatus with:", { appointmentId, status })
    try {
      await appointmentsAPI.updateStatus(appointmentId, status)
      await loadAppointmentsAndRelatedData()
      toast({
        title: "Success",
        description: `Appointment ${status} successfully!`,
      })
    } catch (error) {
      console.error("Error updating appointment status via API:", error)
      toast({
        title: "Error",
        description: "Failed to update appointment. Please check your network and API.",
        variant: "destructive",
      })
    }
  }

  const handleViewPrescription = async (prescriptionId: string) => {
    try {
      const prescriptionData = await prescriptionsAPI.getById(prescriptionId)
      setSelectedPrescriptionForView(prescriptionData)
      setShowPrescriptionDetailDialog(true)
    } catch (error) {
      console.error("Failed to load prescription for view:", error)
      toast({
        title: "Error",
        description: `Failed to load prescription: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  // New handler to pass to DoctorCalendarView for opening prescription form
  const handlePrescribeAppointmentFromCalendar = (appointment: Appointment) => {
    setAppointmentToPrescribe(appointment);
    setShowPrescriptionDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-300"
      case "completed":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const groupAppointmentsByDate = (appointments: Appointment[]) => {
    const grouped: { [key: string]: Appointment[] } = {}
    appointments.forEach((appointment) => {
      const date = appointment.date
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(appointment)
    })
    return grouped
  }
  const groupedAppointments = groupAppointmentsByDate(filteredAppointments)

  const AppointmentCard = ({ appointment, index }: { appointment: Appointment; index: number }) => (
    <Card
      className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center text-white group-hover:text-teal-300 transition-colors">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            {appointment.patientName}
          </CardTitle>
          <Badge className={`${getStatusColor(appointment.status)} transition-all duration-300 group-hover:scale-105`}>
            {appointment.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center text-slate-400 ml-15">
          <Clock className="w-4 h-4 mr-2" />
          {appointment.time}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-4">
          {/* Patient Info */}
          <div className="flex items-center space-x-4 p-3 bg-slate-800/30 rounded-lg">
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                {appointment.consultationType === "video" && <Video className="w-4 h-4 text-green-400" />}
                {appointment.consultationType === "call" && <Phone className="w-4 h-4 text-blue-400" />}
                {appointment.consultationType === "clinic" && <Building className="w-4 h-4 text-purple-400" />}
                <span className="capitalize">{appointment.consultationType} Consultation</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <Mail className="w-4 h-4" />
                <span>patient@example.com</span>
              </div>
            </div>
          </div>
          {/* Action Buttons - Improved Responsiveness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link href={`/doctor/patients/${appointment.patientId}/history`} className="sm:col-span-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full border-slate-600/40 text-slate-200 hover:bg-white/10"
              >
                <Eye className="w-4 h-4 mr-2" /> Patient History
              </Button>
            </Link>
            {appointment.status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                  className="w-full border-red-500/30 text-red-300 hover:bg-red-500/10 hover:border-red-500/50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
            {appointment.status === "confirmed" && (
              <>
                <Button
                  size="sm"
                  onClick={() => {
                    setAppointmentToPrescribe(appointment)
                    setShowPrescriptionDialog(true)
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        setRescheduleDate(appointment.date)
                        setRescheduleTime(appointment.time)
                      }}
                      className="w-full border-teal-500/30 text-teal-300 hover:bg-teal-500/10"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Reschedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Reschedule Appointment</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Change the date and time for {appointment.patientName}'s appointment
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="date" className="text-slate-300">
                          New Date
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="time" className="text-slate-300">
                          New Time
                        </Label>
                        <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="09:00">09:00 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                            <SelectItem value="14:00">02:00 PM</SelectItem>
                            <SelectItem value="15:00">03:00 PM</SelectItem>
                            <SelectItem value="16:00">04:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleReschedule(appointment.id, rescheduleDate, rescheduleTime)}
                          disabled={isRescheduling || !rescheduleDate || !rescheduleTime}
                          className="flex-1 bg-teal-500 hover:bg-teal-600"
                        >
                          {isRescheduling ? "Rescheduling..." : "Reschedule"}
                        </Button>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                            Cancel
                          </Button>
                        </DialogTrigger>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                  className="w-full border-red-500/30 text-red-300 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
            {appointment.status === "completed" && appointment.prescriptionId && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleViewPrescription(appointment.prescriptionId!)}
                className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
              >
                <Eye className="w-4 h-4 mr-1" /> View Prescription
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
              My Appointments
            </h1>

            <p className="text-slate-400 text-xl">Manage your patient appointments efficiently</p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-end mb-6">
            <Button
              onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {viewMode === "list" ? "Calendar View" : "List View"}
            </Button>
          </div>

          {/* Main Content Area */}
          {viewMode === "list" ? (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Side: Original Filters and Appointment List */}
              <div className="flex-1">
                {/* ORIGINAL: Filters (Search and Status) */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-teal-500/50"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48 bg-slate-800/50 border-slate-600/50 text-white">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 text-white">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* ORIGINAL: Appointments Display */}
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse bg-slate-800/50">
                        <CardHeader>
                          <div className="h-6 bg-slate-700 rounded w-3/4" />
                          <div className="h-4 bg-slate-700 rounded w-1/2" />
                        </CardHeader>
                        <CardContent>
                          <div className="h-20 bg-slate-700 rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <Card className="text-center py-16 border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm">
                    <CardContent>
                      <div className="w-24 h-24 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CalendarIcon className="w-12 h-12 text-teal-400" />
                      </div>
                      <h3 className="text-2xl font-semibold text-white mb-2">No Appointments Found</h3>
                      <p className="text-slate-400">
                        {searchTerm || statusFilter !== "all" || selectedDate || selectedTimeSlot !== "all"
                          ? "Try adjusting your search or filter criteria"
                          : "You don't have any appointments scheduled yet"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-12">
                    {Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
                      <div key={date}>
                        <div className="flex items-center mb-6">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                          <h2 className="px-6 text-2xl font-bold text-white bg-slate-900/50 rounded-full py-2">
                            {new Date(date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </h2>
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {dayAppointments.map((appointment, index) => (
                            <AppointmentCard key={appointment.id} appointment={appointment} index={index} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <DoctorCalendarView
              key={appointments.length > 0 ? appointments[0].id : "no-appointments"}
              appointments={appointments}
              onReschedule={handleReschedule}
              onUpdateStatus={updateAppointmentStatus}
              onPrescribeAppointment={handlePrescribeAppointmentFromCalendar}
            />
          )}
        </div>

        {/* Prescription Dialog */}
        {appointmentToPrescribe && (
          <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
            <DialogContent className="max-w-xl md:max-w-2xl p-6 overflow-y-auto max-h-[90vh] bg-slate-800 border-slate-700">
              <PrescriptionForm
                appointmentId={appointmentToPrescribe.id}
                patientId={appointmentToPrescribe.patientId}
                patientName={appointmentToPrescribe.patientName}
                doctorId={appointmentToPrescribe.doctorId}
                doctorName={appointmentToPrescribe.doctorName}
                onSuccess={handlePrescriptionSuccess}
                onClose={() => setShowPrescriptionDialog(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Prescription Detail View Dialog */}
        {selectedPrescriptionForView && (
          <Dialog open={showPrescriptionDetailDialog} onOpenChange={setShowPrescriptionDetailDialog}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[90vh] bg-slate-800 border-slate-700">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="sr-only">Prescription Details</DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto max-h-[calc(90vh-64px)]">
                <PrescriptionDetailView
                  prescription={selectedPrescriptionForView}
                  patient={patients.find(p => p.id === selectedPrescriptionForView.patientId)}
                  doctor={doctors.find(d => d.id === selectedPrescriptionForView.doctorId)}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ProtectedRoute>
  )
}
