"use client"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ModernNavbar } from "@/components/ModernNavbar"
import { HeroSection } from "@/components/HeroSection"
import { SpecialtySlider } from "@/components/SpecialtySlider"
import { TestimonialSection } from "@/components/TestimonialSection"
import { ModernFooter } from "@/components/ModernFooter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { doctorsAPI, type Doctor } from "@/lib/api"
import { Search, MapPin, Star, Calendar, Video, Phone, Building, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import Link from "next/link"

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }
    if (user.role === "doctor") {
      router.push("/doctor/dashboard")
      return
    }
    loadDoctors()
  }, [user, router])

  const loadDoctors = async () => {
    try {
      const doctorsData = await doctorsAPI.getAll()
      setDoctors(doctorsData)
      setFilteredDoctors(doctorsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    let filtered = doctors
    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (selectedSpecialty !== "all") {
      filtered = filtered.filter((doctor) => doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase())
    }
    setFilteredDoctors(filtered)
  }

  // Updated booking function to redirect to booking page
  const handleBookAppointment = (doctor: Doctor, consultationType = "clinic") => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to book an appointment",
        variant: "destructive",
      })
      return
    }
    // Redirect to booking page with doctor ID and consultation type
    router.push(`/book-appointment/${doctor.id}?type=${consultationType}`)
  }

  useEffect(() => {
    handleSearch()
  }, [searchTerm, selectedSpecialty, doctors])

  const handleSpecialtySelect = (specialty: string) => {
    router.push(`/find-doctors?specialty=${specialty}`)
  }

  const handleOnlineSpecialtySelect = (specialty: string) => {
    router.push(`/consultations?specialty=${specialty}&type=online`)
  }

  if (!user || user.role !== "patient") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <ModernNavbar />
        <HeroSection />
        {/* Book Appointment in Clinic Section */}
        <SpecialtySlider title="Book Appointment in Clinic" onSpecialtySelect={handleSpecialtySelect} />
        {/* Online Consultation Section */}
        <SpecialtySlider title="Consult with Doctors Online" onSpecialtySelect={handleOnlineSpecialtySelect} />
        <TestimonialSection />
        <ModernFooter />
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <ModernNavbar />
        <HeroSection />
        {/* Book Appointment in Clinic Section */}
        <SpecialtySlider title="Book Appointment in Clinic" onSpecialtySelect={handleSpecialtySelect} />
        {/* Online Consultation Section */}
        <SpecialtySlider title="Consult with Doctors Online" onSpecialtySelect={handleOnlineSpecialtySelect} />

        {/* Enhanced Find & Book Appointments Section */}
        <section className="py-20 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-72 h-72 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Find & Book Appointments
              </motion.h1>
              <motion.p
                className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Connect with qualified doctors in your area and book appointments instantly
              </motion.p>
            </motion.div>

            {/* Enhanced Search Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="mb-12 bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
                <CardContent className="p-8 relative z-10">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          placeholder="Search doctors, specialties, or conditions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-2xl bg-white/80 backdrop-blur-sm transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div className="lg:w-80">
                      <Select onValueChange={setSelectedSpecialty}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-purple-500 rounded-2xl bg-purple/80 backdrop-blur-sm text-black">
                          <SelectValue placeholder="All Specialties" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-0 shadow-2xl">
                          <SelectItem value="all">All Specialties</SelectItem>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="dermatology">Dermatology</SelectItem>
                          <SelectItem value="neurology">Neurology</SelectItem>
                          <SelectItem value="orthopedics">Orthopedics</SelectItem>
                          <SelectItem value="pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="psychiatry">Psychiatry</SelectItem>
                          <SelectItem value="general">General Medicine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleSearch}
                        className="h-14 px-8 text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Search className="w-5 h-5 mr-2" />
                        Search Doctors
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Doctors Grid */}
            {isLoading ? (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                </div>
                <motion.p
                  className="mt-8 text-xl text-gray-600"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Finding the best doctors for you...
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {filteredDoctors.map((doctor, index) => (
                  <motion.div
                    key={doctor.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group"
                  >
                    <Card className="hover:shadow-2xl transition-all duration-500 bg-white/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden rounded-3xl">
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <CardHeader className="pb-4 relative z-10">
                        <div className="flex items-center space-x-4">
                          <motion.div
                            className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span className="text-white text-2xl font-bold">
                              {doctor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </motion.div>
                          <div className="flex-1">
                            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {doctor.name}
                            </CardTitle>
                            <CardDescription className="text-blue-600 font-semibold text-lg">
                              {doctor.specialty}
                            </CardDescription>
                            <div className="flex items-center mt-2">
                              <Star className="w-5 h-5 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1 font-medium">4.8 (120 reviews)</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6 relative z-10">
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="w-5 h-5 mr-3 text-blue-500" />
                            <span className="font-medium">{doctor.qualifications}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-5 h-5 mr-3 text-green-500" />
                            <span className="font-medium">{doctor.experience} experience</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-5 h-5 mr-3 text-red-500" />
                            <span className="font-medium">{doctor.clinicAddress}</span>
                          </div>
                        </div>

                        {/* Enhanced Consultation Fees */}
                        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-4 rounded-2xl border border-blue-100">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <div className="flex items-center">
                              <Building className="w-5 h-5 mr-2 text-blue-600" />
                              <span className="text-gray-700 font-medium">Clinic Visit:</span>
                            </div>
                            <span className="font-bold text-green-600 text-lg">${doctor.consultationFee}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                              <Video className="w-5 h-5 mr-2 text-purple-600" />
                              <span className="text-gray-700 font-medium">Video Call:</span>
                            </div>
                            <span className="font-bold text-green-600 text-lg">${doctor.videoConsultationFee}</span>
                          </div>
                        </div>

                        {/* Enhanced Available Badge */}
                        <div className="flex items-center justify-between">
                          <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1 rounded-full">
                            <Clock className="w-4 h-4 mr-1" />
                            Available Today
                          </Badge>
                          <span className="text-sm text-gray-500 font-medium">Next: 2:30 PM</span>
                        </div>

                        {/* Enhanced Booking Buttons */}
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link href={`/doctor/${doctor.id}`}>
                            <Button
                              className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300"
                              onClick={() => handleBookAppointment(doctor, "clinic")}
                            >
                              <Building className="w-5 h-5 mr-2" />
                              Book Clinic Visit
                            </Button>
                            </Link>
                          </motion.div>
                          <div className="grid grid-cols-2 gap-3">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Link href={`/booking/${doctor.id}?type=video`}>
                              <Button
                                variant="outline"
                                className="w-full h-12 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 bg-white/80 backdrop-blur-sm rounded-2xl font-semibold transition-all duration-300"
                                onClick={() => handleBookAppointment(doctor, "video")}
                              >
                                <Video className="w-5 h-5 mr-1" />
                                Video
                              </Button>
                              </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Link href={`/booking/${doctor.id}?type=call`}>
                              <Button
                                variant="outline"
                                className="w-full h-12 border-2 border-green-200 text-green-600 hover:bg-green-50 bg-white/80 backdrop-blur-sm rounded-2xl font-semibold transition-all duration-300"
                                onClick={() => handleBookAppointment(doctor, "call")}
                              >
                                <Phone className="w-5 h-5 mr-1" />
                                Call
                              </Button>
                              </Link>
                            </motion.div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {filteredDoctors.length === 0 && !isLoading && (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No doctors found</h3>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                  No doctors found matching your criteria. Try adjusting your search filters.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedSpecialty("all")
                    }}
                    variant="outline"
                    className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-2xl font-semibold"
                  >
                    Clear All Filters
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </section>

        <TestimonialSection />
        <ModernFooter />
      </div>
    </ProtectedRoute>
  )
}
