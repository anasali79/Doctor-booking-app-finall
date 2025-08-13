"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ModernNavbar } from "@/components/ModernNavbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { doctorsAPI, appointmentsAPI, type Doctor } from "@/lib/api"
import {
  Calendar,
  Clock,
  Video,
  Phone,
  Building,
  CreditCard,
  CheckCircle,
  Wifi,
  Shield,
  DollarSign,
  ArrowLeft,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

export default function BookAppointmentPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [consultationType, setConsultationType] = useState(searchParams.get("type") || "clinic")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [bookingStage, setBookingStage] = useState(0)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const bookingStages = [
    { title: "Checking Availability", icon: Calendar, color: "text-fuchsia-400" },
    { title: "Verifying Connection", icon: Wifi, color: "text-cyan-400" },
    { title: "Processing Payment", icon: DollarSign, color: "text-violet-400" },
    { title: "Securing Booking", icon: Shield, color: "text-emerald-400" },
  ]

  useEffect(() => {
    if (params?.id) {
      loadDoctor(params.id as string)
    }
  }, [params?.id])

  useEffect(() => {
    const today = new Date()
    setSelectedDate(today.toISOString().split("T")[0])
  }, [])

  const loadDoctor = async (id: string) => {
    try {
      const doctorData = await doctorsAPI.getById(id)
      setDoctor(doctorData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load doctor information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getConsultationFee = () => {
    if (!doctor) return 0
    return consultationType === "clinic" ? doctor.consultationFee : doctor.videoConsultationFee
  }

  const getAvailableDates = () => {
    const dates: { date: string; display: string; dayName: string }[] = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
      const availabilityKey = consultationType === "clinic" ? "clinic" : "online"
      const isAvailable = doctor?.availability?.[availabilityKey]?.includes(dayName)
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
    return dates
  }

  const handleBookAppointment = async () => {
    if (!doctor || !user || !selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
    setShowPayment(true)
  }

  const handlePayment = async () => {
    if (!doctor || !user || isProcessing) return

    setIsProcessing(true)
    setBookingStage(0)

    try {
      for (let i = 0; i < bookingStages.length; i++) {
        setBookingStage(i)
        const delay = i === 0 ? 2000 : i === 1 ? 1500 : i === 2 ? 2500 : 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }

      const appointment = {
        doctorId: doctor.id,
        patientId: user.id,
        doctorName: doctor.name,
        patientName: user.name,
        specialty: doctor.specialty,
        date: selectedDate,
        time: selectedTime,
        status: "confirmed" as const,
        consultationType,
        symptoms,
        fee: getConsultationFee(),
      }

      await appointmentsAPI.create(appointment)
      setBookingComplete(true)

      toast({
        title: "Success",
        description: "Appointment booked successfully!",
      })
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      })
      setShowPayment(false)
      setBookingStage(0)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelBooking = () => {
    setShowPayment(false)
    setBookingStage(0)
    setIsProcessing(false)
  }

  const Background = () => (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_800px_at_80%_-10%,rgba(168,85,247,0.15),transparent_60%),radial-gradient(1000px_700px_at_-10%_20%,rgba(6,182,212,0.12),transparent_60%),radial-gradient(900px_600px_at_50%_120%,rgba(236,72,153,0.12),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-fuchsia-500 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-cyan-500 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-violet-500 blur-3xl animate-blob animation-delay-4000" />
      </div>
    </>
  )

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["patient"]}>
        <div className="relative min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100 overflow-hidden">
          <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40">
            <ModernNavbar />
          </header>
          {/* Spacer to offset fixed navbar */}
          <div className="h-20 sm:h-24" aria-hidden="true" />
          <Background />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-fuchsia-900/40 border-t-fuchsia-400 mx-auto"></div>
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400/60"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
              </div>
              <motion.p
                className="mt-6 text-lg text-zinc-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Loading booking information...
              </motion.p>
            </motion.div>
          </div>
          <StyleTag />
        </div>
      </ProtectedRoute>
    )
  }

  if (!doctor) {
    return (
      <ProtectedRoute allowedRoles={["patient"]}>
        <div className="relative min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100 overflow-hidden">
          <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40">
            <ModernNavbar />
          </header>
          <div className="h-20 sm:h-24" aria-hidden="true" />
          <Background />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="text-center py-12 bg-zinc-900/50 backdrop-blur border border-white/10 shadow-xl">
              <CardContent>
                <h3 className="text-xl font-semibold text-white mb-2">Doctor not found</h3>
                <p className="text-zinc-300 mb-4">The doctor you're looking for doesn't exist or has been removed.</p>
                <Button
                  onClick={() => router.push("/")}
                  className="bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </div>
          <StyleTag />
        </div>
      </ProtectedRoute>
    )
  }

  if (bookingComplete) {
    return (
      <ProtectedRoute allowedRoles={["patient"]}>
        <div className="relative min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100 overflow-hidden">
          <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40">
            <ModernNavbar />
          </header>
          <div className="h-20 sm:h-24" aria-hidden="true" />
          <Background />
          <div className="max-w-2xl mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card className="text-center py-12 bg-zinc-900/60 backdrop-blur border border-white/10 shadow-2xl">
                <CardContent>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
                  </motion.div>
                  <motion.h2
                    className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Booking Confirmed!
                  </motion.h2>
                  <motion.p
                    className="text-zinc-300 mb-8 text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    Your appointment with Dr. {doctor.name} has been successfully booked.
                  </motion.p>
                  <motion.div
                    className="bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 p-6 rounded-2xl border border-white/10 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Date:</span>
                        <span className="font-semibold text-white">{new Date(selectedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Time:</span>
                        <span className="font-semibold text-white">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Type:</span>
                        <span className="font-semibold text-white capitalize">{consultationType}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Fee:</span>
                        <span className="font-bold text-emerald-400 text-lg">${getConsultationFee()}</span>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <Button
                      onClick={() => router.push("/appointments")}
                      className="bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700"
                    >
                      View Appointments
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/")}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Back to Home
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          <StyleTag />
        </div>
      </ProtectedRoute>
    )
  }

  if (showPayment && isProcessing) {
    return (
      <ProtectedRoute allowedRoles={["patient"]}>
        <div className="relative min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100 overflow-hidden flex items-center justify-center">
          <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40">
            <ModernNavbar />
          </header>
          <div className="h-20 sm:h-24" aria-hidden="true" />
          <Background />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto px-4 w-full"
          >
            <Card className="text-center py-12 bg-zinc-900/60 backdrop-blur border border-white/10 shadow-2xl">
              <CardContent>
                <motion.h2
                  className="text-2xl font-bold text-white mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Booking Your Appointment
                </motion.h2>

                <div className="space-y-6">
                  {bookingStages.map((stage, index) => {
                    const Icon = stage.icon
                    const isActive = index === bookingStage
                    const isCompleted = index < bookingStage

                    return (
                      <motion.div
                        key={index}
                        className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 border ${
                          isActive
                            ? "border-fuchsia-400/40 bg-fuchsia-500/10"
                            : isCompleted
                              ? "border-emerald-400/40 bg-emerald-500/10"
                              : "border-white/10 bg-zinc-800/60"
                        }`}
                        initial={{ opacity: 0.3, x: -20 }}
                        animate={{
                          opacity: isActive || isCompleted ? 1 : 0.6,
                          x: 0,
                          scale: isActive ? 1.02 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isCompleted ? "bg-emerald-500" : isActive ? "bg-fuchsia-500" : "bg-zinc-700"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-zinc-300"}`} />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <h3
                            className={`font-semibold ${
                              isActive ? "text-fuchsia-300" : isCompleted ? "text-emerald-300" : "text-zinc-300"
                            }`}
                          >
                            {stage.title}
                          </h3>
                          {isActive && (
                            <motion.div
                              className="w-full bg-fuchsia-900/40 rounded-full h-2 mt-2"
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                            >
                              <motion.div
                                className="bg-fuchsia-500 h-2 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2 }}
                              />
                            </motion.div>
                          )}
                        </div>
                        {isActive && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-6 h-6 border-2 border-fuchsia-400 border-t-transparent rounded-full"
                          />
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                <motion.p
                  className="mt-8 text-zinc-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Please wait while we process your booking...
                </motion.p>

                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <Button
                    variant="outline"
                    onClick={handleCancelBooking}
                    className="text-zinc-200 border-white/20 hover:bg-white/10 bg-transparent"
                  >
                    Cancel Booking
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
          <StyleTag />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="relative min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100 overflow-hidden">
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40">
          <ModernNavbar />
        </header>
        {/* Spacer to offset fixed navbar so Back button never hides */}
        <div className="h-20 sm:h-24" aria-hidden="true" />
        <Background />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Back Button */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-white/20 text-zinc-200 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </motion.div>

          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Book Appointment
            </h1>
            <p className="text-zinc-300 text-base sm:text-lg">Schedule your consultation with Dr. {doctor.name}</p>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Booking Form */}
            <div className="xl:col-span-2 space-y-6">
              <AnimatePresence mode="wait">
                {!showPayment ? (
                  <motion.div
                    key="booking-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {/* Doctor Info */}
                    <Card className="bg-zinc-900/50 backdrop-blur border border-white/10 shadow-xl">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-fuchsia-600 via-violet-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto sm:mx-0 shadow-lg shadow-fuchsia-600/20">
                            <span className="text-white text-xl sm:text-2xl font-bold">
                              {doctor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div className="text-center sm:text-left">
                            <h3 className="text-xl sm:text-2xl font-bold text-white">{doctor.name}</h3>
                            <p className="text-fuchsia-300 font-medium">{doctor.specialty}</p>
                            <div className="flex items-center justify-center sm:justify-start mt-2">
                              {consultationType === "clinic" && <Building className="w-4 h-4 mr-2 text-cyan-300" />}
                              {consultationType === "video" && <Video className="w-4 h-4 mr-2 text-fuchsia-300" />}
                              {consultationType === "call" && <Phone className="w-4 h-4 mr-2 text-violet-300" />}
                              <span className="text-sm text-zinc-300 capitalize">{consultationType} Consultation</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Date Selection */}
                    <Card
                      id="select-date"
                      className="scroll-mt-28 bg-zinc-900/50 backdrop-blur border border-white/10 shadow-xl"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg sm:text-xl text-white">
                          <Calendar className="w-5 h-5 mr-2 text-cyan-300" />
                          Select Date
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {getAvailableDates().map((dateOption, index) => (
                            <motion.button
                              key={dateOption.date}
                              onClick={() => setSelectedDate(dateOption.date)}
                              className={`p-3 text-center border rounded-xl transition-all duration-200 ${
                                selectedDate === dateOption.date
                                  ? "border-fuchsia-400 bg-fuchsia-500/10 text-fuchsia-200 shadow-md"
                                  : "border-white/10 hover:border-white/20 hover:bg-white/5 text-zinc-200"
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.06 }}
                            >
                              <div className="text-sm font-semibold">{dateOption.display}</div>
                              <div className="text-xs text-zinc-400 mt-1">{dateOption.dayName}</div>
                            </motion.button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Time Selection */}
                    <Card
                      id="select-time"
                      className="scroll-mt-28 bg-zinc-900/50 backdrop-blur border border-white/10 shadow-xl"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg sm:text-xl text-white">
                          <Clock className="w-5 h-5 mr-2 text-violet-300" />
                          Select Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                          {doctor.timeSlots?.map((time, index) => (
                            <motion.button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`p-3 text-center border rounded-xl transition-all duration-200 text-sm font-medium ${
                                selectedTime === time
                                  ? "border-fuchsia-400 bg-fuchsia-500/10 text-fuchsia-200 shadow-md"
                                  : "border-white/10 hover:border-white/20 hover:bg-white/5 text-zinc-200"
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.04 }}
                            >
                              {time}
                            </motion.button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Symptoms */}
                    <Card className="bg-zinc-900/50 backdrop-blur border border-white/10 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl text-white">Describe Your Symptoms</CardTitle>
                        <CardDescription className="text-zinc-400">
                          Please provide details about your condition to help the doctor prepare
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder="Describe your symptoms, concerns, or reason for consultation..."
                          value={symptoms}
                          onChange={(e) => setSymptoms(e.target.value)}
                          rows={4}
                          className="resize-none bg-white/5 border-white/10 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:border-fuchsia-400"
                        />
                      </CardContent>
                    </Card>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        className="w-full bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-600 hover:from-fuchsia-700 hover:via-violet-700 hover:to-cyan-700 text-white font-semibold py-4 text-lg rounded-xl shadow-lg shadow-fuchsia-600/20"
                        size="lg"
                        onClick={handleBookAppointment}
                        disabled={!selectedDate || !selectedTime}
                      >
                        Proceed to Payment
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  /* Payment Form */
                  <motion.div
                    key="payment-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-zinc-900/50 backdrop-blur border border-white/10 shadow-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg sm:text-xl text-white">
                          <CreditCard className="w-5 h-5 mr-2 text-fuchsia-300" />
                          Payment Information
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                          Complete your payment to confirm the appointment
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cardName" className="text-zinc-300">
                              Cardholder Name
                            </Label>
                            <Input
                              id="cardName"
                              placeholder="John Doe"
                              className="mt-1 bg-white/5 border-white/10 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:border-fuchsia-400"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cardNumber" className="text-zinc-300">
                              Card Number
                            </Label>
                            <Input
                              id="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              className="mt-1 bg-white/5 border-white/10 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:border-fuchsia-400"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry" className="text-zinc-300">
                              Expiry Date
                            </Label>
                            <Input
                              id="expiry"
                              placeholder="MM/YY"
                              className="mt-1 bg-white/5 border-white/10 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:border-fuchsia-400"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv" className="text-zinc-300">
                              CVV
                            </Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              className="mt-1 bg-white/5 border-white/10 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:border-fuchsia-400"
                            />
                          </div>
                        </div>
                        <div className="pt-6 border-t border-white/10">
                          <div className="flex gap-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowPayment(false)}
                              className="flex-1 border-white/20 text-zinc-200 hover:bg-white/10"
                            >
                              Back
                            </Button>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                              <Button
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-4 text-lg rounded-xl shadow-lg"
                                size="lg"
                                onClick={handlePayment}
                                disabled={isProcessing}
                              >
                                <CreditCard className="w-5 h-5 mr-2" />
                                {isProcessing ? "Processing..." : `Pay $${getConsultationFee()} & Book`}
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Booking Summary */}
            <div className="xl:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="sticky top-28 bg-zinc-900/50 backdrop-blur border border-white/10 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl text-white">Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Doctor:</span>
                        <span className="font-semibold text-white text-right">{doctor.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Specialty:</span>
                        <span className="font-semibold text-white text-right">{doctor.specialty}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Type:</span>
                        <div className="flex items-center">
                          {consultationType === "clinic" && <Building className="w-4 h-4 mr-1 text-cyan-300" />}
                          {consultationType === "video" && <Video className="w-4 h-4 mr-1 text-fuchsia-300" />}
                          {consultationType === "call" && <Phone className="w-4 h-4 mr-1 text-violet-300" />}
                          <span className="font-semibold text-white capitalize">{consultationType}</span>
                        </div>
                      </div>
                      {selectedDate && (
                        <motion.div
                          className="flex justify-between items-center"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="text-zinc-300">Date:</span>
                          <span className="font-semibold text-white text-right">
                            {new Date(selectedDate).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </motion.div>
                      )}
                      {selectedTime && (
                        <motion.div
                          className="flex justify-between items-center"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <span className="text-zinc-300">Time:</span>
                          <span className="font-semibold text-white">{selectedTime}</span>
                        </motion.div>
                      )}
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-white">Total:</span>
                        <motion.span
                          className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          ${getConsultationFee()}
                        </motion.span>
                      </div>
                    </div>
                    {consultationType !== "clinic" && (
                      <motion.div
                        className="bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 p-4 rounded-xl border border-white/10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <p className="text-sm text-zinc-300">
                          <strong className="text-white">Note:</strong> You will receive a{" "}
                          {consultationType === "video" ? "video call" : "phone call"} link/number before your
                          appointment.
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        <StyleTag />
      </div>
    </ProtectedRoute>
  )
}

function StyleTag() {
  return (
    <style jsx global>{`
      @keyframes blob {
        0% {
          transform: translate(0px, 0px) scale(1);
        }
        33% {
          transform: translate(20px, -30px) scale(1.05);
        }
        66% {
          transform: translate(-15px, 10px) scale(0.98);
        }
        100% {
          transform: translate(0px, 0px) scale(1);
        }
      }
      .animate-blob {
        animation: blob 18s infinite;
      }
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      .animation-delay-4000 {
        animation-delay: 4s;
      }
    `}</style>
  )
}
