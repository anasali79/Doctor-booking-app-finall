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

  // Booking stages
  const bookingStages = [
    { title: "Checking Availability", icon: Calendar, color: "text-blue-500" },
    { title: "Verifying Connection", icon: Wifi, color: "text-green-500" },
    { title: "Processing Payment", icon: DollarSign, color: "text-purple-500" },
    { title: "Securing Booking", icon: Shield, color: "text-emerald-500" },
  ]

  useEffect(() => {
    if (params.id) {
      loadDoctor(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    // Set default date to today
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
    const dates = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
      // Check if doctor is available on this day
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
      // Animate through booking stages with proper error handling
      for (let i = 0; i < bookingStages.length; i++) {
        setBookingStage(i)

        // Simulate different processing times for each stage
        const delay = i === 0 ? 2000 : i === 1 ? 1500 : i === 2 ? 2500 : 1000
        await new Promise((resolve) => setTimeout(resolve, delay))

        // Add some realistic stage-specific logic
        if (i === 0) {
          // Checking availability - could add actual availability check here
          console.log("Checking availability...")
        } else if (i === 1) {
          // Verifying connection - could add connection test here
          console.log("Verifying connection...")
        } else if (i === 2) {
          // Processing payment - this is where the actual API call should happen
          console.log("Processing payment...")
        }
      }

      // Create the appointment after all stages complete
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
      // Reset states on error
      setShowPayment(false)
      setBookingStage(0)
    } finally {
      setIsProcessing(false)
    }
  }

  // Add a function to cancel booking process
  const handleCancelBooking = () => {
    setShowPayment(false)
    setBookingStage(0)
    setIsProcessing(false)
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["patient"]}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <ModernNavbar />
          <div className="max-w-4xl mx-auto px-4 py-8">
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
                className="mt-6 text-lg text-gray-600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Loading booking information...
              </motion.p>
            </motion.div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!doctor) {
    return (
      <ProtectedRoute allowedRoles={["patient"]}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <ModernNavbar />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Doctor not found</h3>
                <p className="text-gray-600 mb-4">The doctor you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => router.push("/")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (bookingComplete) {
    return (
      <ProtectedRoute allowedRoles={["patient"]}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <ModernNavbar />
          <div className="max-w-2xl mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card className="text-center py-12 bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
                <CardContent>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                  </motion.div>
                  <motion.h2
                    className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Booking Confirmed!
                  </motion.h2>
                  <motion.p
                    className="text-gray-600 mb-8 text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    Your appointment with Dr. {doctor.name} has been successfully booked.
                  </motion.p>
                  <motion.div
                    className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(selectedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-semibold text-gray-900">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-semibold text-gray-900 capitalize">{consultationType}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Fee:</span>
                        <span className="font-bold text-green-600 text-lg">${getConsultationFee()}</span>
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
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      View Appointments
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/")}>
                      Back to Home
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Booking stages animation with cancel option
  if (showPayment && isProcessing) {
    return (
      <ProtectedRoute allowedRoles={["patient"]}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto px-4"
          >
            <Card className="text-center py-12 bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent>
                <motion.h2
                  className="text-2xl font-bold text-gray-900 mb-8"
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
                        className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-blue-50 border-2 border-blue-200"
                            : isCompleted
                              ? "bg-green-50 border-2 border-green-200"
                              : "bg-gray-50 border-2 border-gray-100"
                        }`}
                        initial={{ opacity: 0.3, x: -20 }}
                        animate={{
                          opacity: isActive || isCompleted ? 1 : 0.3,
                          x: 0,
                          scale: isActive ? 1.02 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isCompleted ? "bg-green-500" : isActive ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-gray-500"}`} />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <h3
                            className={`font-semibold ${
                              isActive ? "text-blue-700" : isCompleted ? "text-green-700" : "text-gray-500"
                            }`}
                          >
                            {stage.title}
                          </h3>
                          {isActive && (
                            <motion.div
                              className="w-full bg-blue-200 rounded-full h-2 mt-2"
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                            >
                              <motion.div
                                className="bg-blue-500 h-2 rounded-full"
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
                            className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                          />
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                <motion.p
                  className="mt-8 text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Please wait while we process your booking...
                </motion.p>

                {/* Add cancel button for better UX */}
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <Button
                    variant="outline"
                    onClick={handleCancelBooking}
                    className="text-gray-600 hover:text-gray-800 bg-transparent"
                  >
                    Cancel Booking
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <ModernNavbar />
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
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
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
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Book Appointment
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">Schedule your consultation with Dr. {doctor.name}</p>
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
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                            <span className="text-white text-xl sm:text-2xl font-bold">
                              {doctor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div className="text-center sm:text-left">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{doctor.name}</h3>
                            <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                            <div className="flex items-center justify-center sm:justify-start mt-2">
                              {consultationType === "clinic" && <Building className="w-4 h-4 mr-2" />}
                              {consultationType === "video" && <Video className="w-4 h-4 mr-2" />}
                              {consultationType === "call" && <Phone className="w-4 h-4 mr-2" />}
                              <span className="text-sm text-gray-600 capitalize">{consultationType} Consultation</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Date Selection */}
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg sm:text-xl">
                          <Calendar className="w-5 h-5 mr-2" />
                          Select Date
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {getAvailableDates().map((dateOption, index) => (
                            <motion.button
                              key={dateOption.date}
                              onClick={() => setSelectedDate(dateOption.date)}
                              className={`p-3 text-center border-2 rounded-xl transition-all duration-200 ${
                                selectedDate === dateOption.date
                                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="text-sm font-semibold">{dateOption.display}</div>
                              <div className="text-xs text-gray-500 mt-1">{dateOption.dayName}</div>
                            </motion.button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Time Selection */}
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg sm:text-xl">
                          <Clock className="w-5 h-5 mr-2" />
                          Select Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                          {doctor.timeSlots?.map((time, index) => (
                            <motion.button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`p-3 text-center border-2 rounded-xl transition-all duration-200 text-sm font-medium ${
                                selectedTime === time
                                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              {time}
                            </motion.button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Symptoms */}
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Describe Your Symptoms</CardTitle>
                        <CardDescription>
                          Please provide details about your condition to help the doctor prepare
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder="Describe your symptoms, concerns, or reason for consultation..."
                          value={symptoms}
                          onChange={(e) => setSymptoms(e.target.value)}
                          rows={4}
                          className="resize-none"
                        />
                      </CardContent>
                    </Card>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 text-lg rounded-xl shadow-lg"
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
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg sm:text-xl">
                          <CreditCard className="w-5 h-5 mr-2" />
                          Payment Information
                        </CardTitle>
                        <CardDescription>Complete your payment to confirm the appointment</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cardName">Cardholder Name</Label>
                            <Input id="cardName" placeholder="John Doe" className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="mt-1" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input id="expiry" placeholder="MM/YY" className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" placeholder="123" className="mt-1" />
                          </div>
                        </div>
                        <div className="pt-6 border-t border-gray-200">
                          <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setShowPayment(false)} className="flex-1">
                              Back
                            </Button>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                              <Button
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 text-lg rounded-xl shadow-lg"
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
                <Card className="sticky top-8 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Doctor:</span>
                        <span className="font-semibold text-gray-900 text-right">{doctor.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Specialty:</span>
                        <span className="font-semibold text-gray-900 text-right">{doctor.specialty}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Type:</span>
                        <div className="flex items-center">
                          {consultationType === "clinic" && <Building className="w-4 h-4 mr-1" />}
                          {consultationType === "video" && <Video className="w-4 h-4 mr-1" />}
                          {consultationType === "call" && <Phone className="w-4 h-4 mr-1" />}
                          <span className="font-semibold text-gray-900 capitalize">{consultationType}</span>
                        </div>
                      </div>
                      {selectedDate && (
                        <motion.div
                          className="flex justify-between items-center"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="text-gray-600">Date:</span>
                          <span className="font-semibold text-gray-900 text-right">
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
                          <span className="text-gray-600">Time:</span>
                          <span className="font-semibold text-gray-900">{selectedTime}</span>
                        </motion.div>
                      )}
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <motion.span
                          className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          ${getConsultationFee()}
                        </motion.span>
                      </div>
                    </div>
                    {consultationType !== "clinic" && (
                      <motion.div
                        className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> You will receive a{" "}
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
      </div>
    </ProtectedRoute>
  )
}
