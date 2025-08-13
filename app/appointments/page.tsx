"use client"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ModernNavbar } from "@/components/ModernNavbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  appointmentsAPI,
  doctorsAPI,
  patientsAPI,
  prescriptionsAPI,
  type Appointment,
  type Prescription,
} from "@/lib/api"
import { Listbox, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid"
import {
  Calendar,
  Clock,
  Stethoscope,
  Video,
  Phone,
  Building,
  RotateCcw,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Printer,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { PrescriptionDetailView } from "@/components/PrescriptionDetailView"
import { generatePrescriptionPdf, printPrescription } from "@/lib/prescription-utils" // Import new utilities

export default function AppointmentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // New states for prescription viewing
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [prescriptionPatient, setPrescriptionPatient] = useState<any>(null)
  const [prescriptionDoctor, setPrescriptionDoctor] = useState<any>(null)
  const [isLoadingPrescription, setIsLoadingPrescription] = useState(false)

  // Reschedule form states
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [availableDates, setAvailableDates] = useState<any[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      loadAppointments()
    }
  }, [user])

  const loadAppointments = async () => {
    if (!user) return
    try {
      const appointmentsData = await appointmentsAPI.getByPatientId(user.id)
      setAppointments(appointmentsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailableDates = async (doctorId: string) => {
    try {
      const doctor = await doctorsAPI.getById(doctorId)
      const dates = []
      const today = new Date()
      for (let i = 1; i < 15; i++) {
        // Start from tomorrow
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
        // Check if doctor is available on this day
        const isAvailable =
          doctor?.availability?.clinic?.includes(dayName) || doctor?.availability?.online?.includes(dayName)
        if (isAvailable) {
          dates.push({
            date: date.toISOString().split("T")[0],
            display: date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
            dayName,
          })
        }
      }
      setAvailableDates(dates)
      setAvailableTimes(doctor?.timeSlots || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load available dates",
        variant: "destructive",
      })
    }
  }

  // Updated for dark theme badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      case "pending":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30"
      case "cancelled":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30"
      case "completed":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30"
      case "rescheduled":
        return "bg-violet-500/15 text-violet-300 border-violet-500/30"
      default:
        return "bg-slate-700 text-slate-200 border-slate-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "cancelled":
        return <X className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "rescheduled":
        return <RotateCcw className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />
      case "call":
        return <Phone className="w-4 h-4" />
      default:
        return <Building className="w-4 h-4" />
    }
  }

  const filterAppointments = (status: string) => {
    const now = new Date()
    const today = now.toISOString().split("T")[0]
    switch (status) {
      case "upcoming":
        return appointments.filter(
          (apt) => (apt.status === "confirmed" || apt.status === "pending") && apt.date >= today,
        )
      case "completed":
        return appointments.filter((apt) => apt.status === "completed")
      case "cancelled":
        return appointments.filter((apt) => apt.status === "cancelled")
      case "rescheduled":
        return appointments.filter((apt) => apt.status === "rescheduled")
      default:
        return appointments
    }
  }

  const handleRescheduleClick = async (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setNewDate("")
    setNewTime("")
    await loadAvailableDates(appointment.doctorId)
    setShowRescheduleDialog(true)
  }

  const handleRescheduleConfirm = async () => {
    if (!selectedAppointment || !newDate || !newTime) {
      toast({
        title: "Error",
        description: "Please select both date and time",
        variant: "destructive",
      })
      return
    }
    setIsRescheduling(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const updatedAppointments = appointments.map((apt) =>
        apt.id === selectedAppointment.id
          ? {
              ...apt,
              date: newDate,
              time: newTime,
              status: "rescheduled" as const,
            }
          : apt,
      )
      setAppointments(updatedAppointments)
      setShowRescheduleDialog(false)
      setSelectedAppointment(null)
      toast({
        title: "Success",
        description: `Appointment rescheduled to ${new Date(newDate).toLocaleDateString()} at ${newTime}. Check the Rescheduled tab.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      })
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowCancelDialog(true)
  }

  const handleCancelConfirm = async () => {
    if (!selectedAppointment) return
    setIsCancelling(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const updatedAppointments = appointments.map((apt) =>
        apt.id === selectedAppointment.id ? { ...apt, status: "cancelled" as const } : apt,
      )
      setAppointments(updatedAppointments)
      setShowCancelDialog(false)
      setSelectedAppointment(null)
      toast({
        title: "Success",
        description: "Appointment cancelled successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  // New function to handle viewing prescription
  const handleViewPrescription = async (appointment: Appointment) => {
    if (!appointment.prescriptionId) {
      toast({
        title: "No Prescription",
        description: "No prescription found for this appointment.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingPrescription(true)
    try {
      const prescription = await prescriptionsAPI.getById(appointment.prescriptionId)
      const patient = await patientsAPI.getById(appointment.patientId)
      const doctor = await doctorsAPI.getById(appointment.doctorId)

      setSelectedPrescription(prescription)
      setPrescriptionPatient(patient)
      setPrescriptionDoctor(doctor)
      setShowPrescriptionDialog(true)
    } catch (error) {
      console.error("Failed to load prescription details:", error)
      toast({
        title: "Error",
        description: "Failed to load prescription details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPrescription(false)
    }
  }

  // New function to handle downloading prescription as PDF
  const handleDownloadPdf = () => {
    if (selectedPrescription && prescriptionPatient && prescriptionDoctor) {
      generatePrescriptionPdf(selectedPrescription, prescriptionPatient, prescriptionDoctor)
    } else {
      toast({
        title: "Error",
        description: "Prescription data not available for download.",
        variant: "destructive",
      })
    }
  }

  // New function to handle printing prescription
  const handlePrint = () => {
    if (selectedPrescription) {
      printPrescription(selectedPrescription.id)
    } else {
      toast({
        title: "Error",
        description: "Prescription data not available for printing.",
        variant: "destructive",
      })
    }
  }

  const tabOptions = [
    { id: "upcoming", label: "Upcoming", count: filterAppointments("upcoming").length, color: "text-blue-600" },
    { id: "completed", label: "Completed", count: filterAppointments("completed").length, color: "text-green-600" },
    { id: "cancelled", label: "Cancelled", count: filterAppointments("cancelled").length, color: "text-red-600" },
    {
      id: "rescheduled",
      label: "Rescheduled",
      count: filterAppointments("rescheduled").length,
      color: "text-purple-600",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["patient"]}>
        <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <ModernNavbar />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-2xl animate-pulse [animation-delay:1000ms]" />
            <div className="absolute bottom-32 left-32 w-40 h-40 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl animate-pulse [animation-delay:2000ms]" />
            <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-2xl animate-pulse [animation-delay:3000ms]" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
              </div>
              <motion.p
                className="mt-6 text-lg text-slate-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Loading your appointments...
              </motion.p>
            </motion.div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <ModernNavbar />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-2xl animate-pulse [animation-delay:1000ms]" />
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl animate-pulse [animation-delay:2000ms]" />
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-2xl animate-pulse [animation-delay:3000ms]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              My Appointments
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
              Manage your healthcare appointments with ease
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="sm:hidden w-full mb-4 z-10">
                <Listbox value={activeTab} onChange={setActiveTab}>
                  <div className="relative">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-slate-900/70 py-3 pl-4 pr-10 text-left border border-white/10 shadow-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300 text-slate-200 backdrop-blur">
                      <span className="block truncate font-semibold">
                        {tabOptions.find((opt) => opt.id === activeTab)?.label} (
                        {tabOptions.find((opt) => opt.id === activeTab)?.count})
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronUpDownIcon className="h-5 w-5 text-slate-400 transition-transform duration-300 group-open:rotate-180" />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 scale-95 -translate-y-2"
                      enterTo="opacity-100 scale-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 scale-100 translate-y-0"
                      leaveTo="opacity-0 scale-95 -translate-y-2"
                    >
                      <Listbox.Options className="absolute mt-2 w-full max-h-60 overflow-auto rounded-xl bg-slate-900/90 py-1 text-base shadow-2xl ring-1 ring-white/10 focus:outline-none sm:text-sm z-20 backdrop-blur">
                        {tabOptions.map((tab) => (
                          <Listbox.Option
                            key={tab.id}
                            value={tab.id}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-all duration-200 ${active ? "bg-white/10 text-white scale-[1.01]" : "text-slate-200"}`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className="block truncate font-medium text-slate-200">
                                  {tab.label} ({tab.count})
                                </span>
                                {selected && (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400">
                                    <CheckIcon className="h-5 w-5" />
                                  </span>
                                )}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
              <TabsList className="hidden sm:flex flex-wrap justify-between gap-2 bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-sm border border-white/10 rounded-2xl p-2 h-auto shadow-2xl">
                <TabsTrigger
                  value="upcoming"
                  className="flex items-center justify-center gap-2 px-4 py-3 sm:px-6 w-full sm:w-auto rounded-xl text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-500 hover:bg-white/5 group"
                >
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex items-center gap-2">
                    <Clock className="w-4 h-4 group-data-[state=active]:animate-pulse" />
                    <span className="hidden sm:inline font-medium text-sm">Upcoming</span>
                    <span className="sm:hidden font-medium text-sm">Up</span>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                      <Badge
                        variant="secondary"
                        className="ml-1 bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold"
                      >
                        {filterAppointments("upcoming").length}
                      </Badge>
                    </motion.div>
                  </motion.div>
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="flex items-center justify-center gap-2 px-4 py-3 sm:px-6 w-full sm:w-auto rounded-xl text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-500 hover:bg-white/5 group"
                >
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 group-data-[state=active]:animate-bounce" />
                    <span className="hidden sm:inline font-medium text-sm">Completed</span>
                    <span className="sm:hidden font-medium text-sm">Done</span>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
                      <Badge
                        variant="secondary"
                        className="ml-1 bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold"
                      >
                        {filterAppointments("completed").length}
                      </Badge>
                    </motion.div>
                  </motion.div>
                </TabsTrigger>
                <TabsTrigger
                  value="cancelled"
                  className="flex items-center justify-center gap-2 px-4 py-3 sm:px-6 w-full sm:w-auto rounded-xl text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-pink-700 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-500 hover:bg-white/5 group"
                >
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex items-center gap-2">
                    <X className="w-4 h-4 group-data-[state=active]:animate-pulse" />
                    <span className="hidden sm:inline font-medium text-sm">Cancelled</span>
                    <span className="sm:hidden font-medium text-sm">Cancel</span>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}>
                      <Badge
                        variant="secondary"
                        className="ml-1 bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold"
                      >
                        {filterAppointments("cancelled").length}
                      </Badge>
                    </motion.div>
                  </motion.div>
                </TabsTrigger>
                <TabsTrigger
                  value="rescheduled"
                  className="flex items-center justify-center gap-2 px-4 py-3 sm:px-6 w-full sm:w-auto rounded-xl text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-500 hover:bg-white/5 group"
                >
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 group-data-[state=active]:animate-spin" />
                    <span className="hidden sm:inline font-medium text-sm">Rescheduled</span>
                    <span className="sm:hidden font-medium text-sm">Resc</span>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}>
                      <Badge
                        variant="secondary"
                        className="ml-1 bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold"
                      >
                        {filterAppointments("rescheduled").length}
                      </Badge>
                    </motion.div>
                  </motion.div>
                </TabsTrigger>
              </TabsList>
              <AnimatePresence mode="wait">
                {["upcoming", "completed", "cancelled", "rescheduled"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-0">
                    <motion.div
                      key={`${tab}-content`}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
                    >
                      {filterAppointments(tab).length === 0 ? (
                        <motion.div
                          className="col-span-full"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                        >
                          {/* Dark empty-state card */}
                          <Card className="text-center py-12 sm:py-16 bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-sm border border-white/10 shadow-2xl">
                            <CardContent>
                              <motion.div
                                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.3 }}
                              >
                                {tab === "upcoming" && <Clock className="w-10 h-10 text-blue-300" />}
                                {tab === "completed" && <CheckCircle className="w-10 h-10 text-green-300" />}
                                {tab === "cancelled" && <X className="w-10 h-10 text-rose-300" />}
                                {tab === "rescheduled" && <RotateCcw className="w-10 h-10 text-purple-300" />}
                              </motion.div>
                              <motion.h3
                                className="text-xl font-semibold text-white mb-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                              >
                                No {tab} appointments
                              </motion.h3>
                              <motion.p
                                className="text-slate-300 mb-6"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                              >
                                {tab === "upcoming" && "You don't have any upcoming appointments."}
                                {tab === "completed" && "No completed appointments yet."}
                                {tab === "cancelled" && "No cancelled appointments."}
                                {tab === "rescheduled" && "No rescheduled appointments."}
                              </motion.p>
                              {tab === "upcoming" && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.5 }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    onClick={() => (window.location.href = "/find-doctors")}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                                  >
                                    Book New Appointment
                                  </Button>
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ) : (
                        filterAppointments(tab).map((appointment, index) => (
                          <motion.div
                            key={appointment.id}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.9 }}
                            transition={{
                              duration: 0.4,
                              delay: index * 0.1,
                              ease: "easeOut",
                            }}
                            whileHover={{
                              y: -8,
                              scale: 1.03,
                              transition: { duration: 0.2 },
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Dark appointment card */}
                            <Card className="hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-white/10 shadow-lg overflow-hidden group relative">
                              {/* Status indicator line */}
                              <div
                                className={`absolute top-0 left-0 right-0 h-1 ${
                                  appointment.status === "confirmed"
                                    ? "bg-gradient-to-r from-green-400 to-green-600"
                                    : appointment.status === "pending"
                                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                                      : appointment.status === "cancelled"
                                        ? "bg-gradient-to-r from-rose-400 to-rose-600"
                                        : appointment.status === "completed"
                                          ? "bg-gradient-to-r from-blue-400 to-blue-600"
                                          : "bg-gradient-to-r from-purple-400 to-purple-600"
                                }`}
                              />
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-3">
                                    <motion.div
                                      className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg"
                                      whileHover={{ scale: 1.1, rotate: 5 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      {appointment.doctorName.charAt(0)}
                                    </motion.div>
                                    <div>
                                      <CardTitle className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                                        {appointment.doctorName}
                                      </CardTitle>
                                      <CardDescription className="flex items-center text-blue-300 font-medium">
                                        <Stethoscope className="w-4 h-4 mr-1" />
                                        {appointment.specialty}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                                    <Badge
                                      className={`${getStatusColor(appointment.status)} border font-medium shadow-sm`}
                                    >
                                      <span className="flex items-center gap-1">
                                        {getStatusIcon(appointment.status)}
                                        {appointment.status}
                                      </span>
                                    </Badge>
                                  </motion.div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <motion.div
                                    className="flex items-center text-sm text-slate-300"
                                    whileHover={{ x: 2 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                                    <span className="font-medium">
                                      {new Date(appointment.date).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </motion.div>
                                  <motion.div
                                    className="flex items-center text-sm text-slate-300"
                                    whileHover={{ x: 2 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Clock className="w-4 h-4 mr-2 text-purple-300" />
                                    <span className="font-medium">{appointment.time}</span>
                                  </motion.div>
                                  <motion.div
                                    className="flex items-center text-sm text-slate-300 sm:col-span-2"
                                    whileHover={{ x: 2 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {getConsultationIcon(appointment.consultationType)}
                                    <span className="ml-2 font-medium capitalize">
                                      {appointment.consultationType} Consultation
                                    </span>
                                  </motion.div>
                                </div>
                                {appointment.fee && (
                                  <motion.div
                                    className="flex items-center justify-between pt-3 border-t border-white/10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                  >
                                    <span className="text-sm text-slate-300">Consultation Fee:</span>
                                    <motion.span
                                      className="text-lg font-bold text-emerald-400"
                                      whileHover={{ scale: 1.1 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      ${appointment.fee}
                                    </motion.span>
                                  </motion.div>
                                )}
                                {tab === "upcoming" &&
                                  (appointment.status === "confirmed" || appointment.status === "pending") && (
                                    <motion.div
                                      className="flex gap-2 pt-3 border-t border-white/10"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.4 }}
                                    >
                                      <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex-1"
                                      >
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full border-blue-400/30 text-blue-300 hover:bg-blue-500/10 bg-transparent hover:border-blue-400/50 transition-all duration-300"
                                          onClick={() => handleRescheduleClick(appointment)}
                                        >
                                          <RotateCcw className="w-4 h-4 mr-1" />
                                          Reschedule
                                        </Button>
                                      </motion.div>
                                      <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex-1"
                                      >
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full border-rose-400/30 text-rose-300 hover:bg-rose-500/10 bg-transparent hover:border-rose-400/50 transition-all duration-300"
                                          onClick={() => handleCancelClick(appointment)}
                                        >
                                          <X className="w-4 h-4 mr-1" />
                                          Cancel
                                        </Button>
                                      </motion.div>
                                    </motion.div>
                                  )}
                                {tab === "completed" && appointment.status === "completed" && (
                                  <motion.div
                                    className="flex gap-2 pt-3 border-t border-white/10"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                  >
                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="flex-1"
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/10 bg-transparent hover:border-emerald-400/50 transition-all duration-300"
                                        onClick={() => handleViewPrescription(appointment)}
                                        disabled={isLoadingPrescription}
                                      >
                                        {isLoadingPrescription ? (
                                          <>
                                            <motion.div
                                              animate={{ rotate: 360 }}
                                              transition={{
                                                duration: 1,
                                                repeat: Number.POSITIVE_INFINITY,
                                                ease: "linear",
                                              }}
                                              className="w-4 h-4 border-2 border-emerald-300 border-t-transparent rounded-full mr-2"
                                            />
                                            Loading...
                                          </>
                                        ) : (
                                          <>
                                            <FileText className="w-4 h-4 mr-1" />
                                            View Prescription
                                          </>
                                        )}
                                      </Button>
                                    </motion.div>
                                  </motion.div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  </TabsContent>
                ))}
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </div>
        {/* Reschedule Dialog */}
        <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-blue-600" />
                Reschedule Appointment
              </DialogTitle>
              <DialogDescription>
                Select a new date and time for your appointment with Dr. {selectedAppointment?.doctorName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">Select New Date</Label>
                <Select value={newDate} onValueChange={setNewDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a date" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.map((dateOption) => (
                      <SelectItem key={dateOption.date} value={dateOption.date}>
                        {dateOption.display} ({dateOption.dayName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Select New Time</Label>
                <Select value={newTime} onValueChange={setNewTime} disabled={!newDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newDate && newTime && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <p className="text-sm text-blue-800">
                    <strong>New appointment:</strong>{" "}
                    {new Date(newDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    at {newTime}
                  </p>
                </motion.div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRescheduleConfirm}
                disabled={isRescheduling || !newDate || !newTime}
                className="flex-1"
              >
                {isRescheduling ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Rescheduling...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Confirm Reschedule
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRescheduleDialog(false)}
                className="flex-1"
                disabled={isRescheduling}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Cancel Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <X className="w-5 h-5 text-red-600" />
                Cancel Appointment
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your appointment with Dr. {selectedAppointment?.doctorName}? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
              <div className="py-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedAppointment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium text-gray-900">{selectedAppointment.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {selectedAppointment.consultationType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="destructive" onClick={handleCancelConfirm} disabled={isCancelling} className="flex-1">
                {isCancelling ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Yes, Cancel Appointment
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                className="flex-1"
                disabled={isCancelling}
              >
                Keep Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Prescription Dialog */}
        <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Prescription Details
              </DialogTitle>
              <DialogDescription>View your prescription details for this completed appointment</DialogDescription>
            </DialogHeader>
            {selectedPrescription && (
              <div className="py-4" id={`prescription-card-${selectedPrescription.id}`}>
                {" "}
                {/* Add ID for printing */}
                <PrescriptionDetailView
                  prescription={selectedPrescription}
                  patient={prescriptionPatient}
                  doctor={prescriptionDoctor}
                />
              </div>
            )}
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleDownloadPdf}
                disabled={isLoadingPrescription || !selectedPrescription}
                className="w-full sm:w-auto bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                disabled={isLoadingPrescription || !selectedPrescription}
                className="w-full sm:w-auto bg-transparent"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
