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

// Updated background to match HeroSection gradient
const Background = () => (
  <>
    {/* HeroSection-matching gradient */}
    <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

    {/* Animated gradient blobs */}
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-24 -left-28 h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/14 blur-3xl animate-blob" />
      <div className="absolute top-1/4 -right-20 h-[24rem] w-[24rem] rounded-full bg-cyan-500/14 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-6rem] left-[20%] h-[28rem] w-[28rem] rounded-full bg-violet-500/12 blur-3xl animate-blob animation-delay-4000" />
    </div>

    {/* Subtle radial glows */}
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-24 -left-28 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.12),transparent)] blur-2xl" />
      <div className="absolute -top-10 right-10 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(closest-side,rgba(14,165,233,0.10),transparent)] blur-2xl" />
      <div className="absolute top-1/3 left-[12%] h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(closest-side,rgba(37,99,235,0.08),transparent)] blur-[36px] opacity-70" />
    </div>
  </>
)

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
    void loadDoctors()
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
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (selectedSpecialty !== "all") {
      filtered = filtered.filter(
        (doctor) => doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase()
      )
    }
    setFilteredDoctors(filtered)
  }

  const handleBookAppointment = (
    doctor: Doctor,
    consultationType: "clinic" | "video" | "call" = "clinic"
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to book an appointment",
        variant: "destructive",
      })
      return
    }
    router.push(`/booking/${doctor.id}?type=${consultationType}`)
  }

  useEffect(() => {
    handleSearch()
  }, [searchTerm, selectedSpecialty, doctors])

  const handleSpecialtySelect = (specialty: string) => {
    router.push(`/find-doctors?specialty=${specialty}`)
  }

  const handleOnlineSpecialtySelect = (specialty: string) => {
    router.push(`/consultations/video?specialty=${specialty}`)
  }

  // Logged-out view
  if (!user || user.role !== "patient") {
    return (
      <div className="relative min-h-screen text-slate-100 overflow-hidden">
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40">
          <ModernNavbar />
        </header>
        <div className="h-16 sm:h-20" />
        <Background />

        <div className="relative">
          <HeroSection />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SpecialtySlider title="Book Appointment in Clinic" onSpecialtySelect={handleSpecialtySelect} />
          </div>
          <div className="mt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SpecialtySlider title="Consult with Doctors Online" onSpecialtySelect={handleOnlineSpecialtySelect} />
          </div>

          <DarkFindAndBookSection
            isLoading={isLoading}
            filteredDoctors={filteredDoctors}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedSpecialty={selectedSpecialty}
            setSelectedSpecialty={setSelectedSpecialty}
            handleSearch={handleSearch}
            handleBookAppointment={handleBookAppointment}
          />
          <TestimonialSection />
          <ModernFooter />
          <StyleTag />
        </div>
      </div>
    )
  }

  // Authenticated patient view
  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="relative min-h-screen text-slate-100 overflow-hidden">
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40">
          <ModernNavbar />
        </header>
        <div className="h-16 sm:h-20" />
        <Background />

        <HeroSection />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SpecialtySlider title="Book Appointment in Clinic" onSpecialtySelect={handleSpecialtySelect} />
        </div>
        <div className="mt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SpecialtySlider title="Consult with Doctors Online" onSpecialtySelect={handleOnlineSpecialtySelect} />
        </div>

        <DarkFindAndBookSection
          isLoading={isLoading}
          filteredDoctors={filteredDoctors}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedSpecialty={selectedSpecialty}
          setSelectedSpecialty={setSelectedSpecialty}
          handleSearch={handleSearch}
          handleBookAppointment={handleBookAppointment}
        />

        <TestimonialSection />
        <ModernFooter />
        <StyleTag />
      </div>
    </ProtectedRoute>
  )
}

// DarkFindAndBookSection component code same as before...
// StyleTag component code same as before...
function DarkFindAndBookSection(props: {
  isLoading: boolean
  filteredDoctors: Doctor[]
  searchTerm: string
  setSearchTerm: (v: string) => void
  selectedSpecialty: string
  setSelectedSpecialty: (v: string) => void
  handleSearch: () => void
  handleBookAppointment: (doctor: Doctor, type?: "clinic" | "video" | "call") => void
}) {
  const {
    isLoading,
    filteredDoctors,
    searchTerm,
    setSearchTerm,
    selectedSpecialty,
    setSelectedSpecialty,
    handleSearch,
    handleBookAppointment,
  } = props

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Subtle glows continue the navy look */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
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
            className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-200 via-cyan-200 to-indigo-200 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Find & Book Appointments
          </motion.h1>
          <motion.p
            className="text-slate-300 text-xl max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Connect with qualified doctors in your area and book appointments instantly
          </motion.p>
        </motion.div>

        {/* Search bar card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="mb-12 bg-white/5 backdrop-blur border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(59,130,246,0.05),rgba(14,165,233,0.05))]" />
            <CardContent className="p-6 sm:p-8 relative z-10">
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                <div className="flex-1">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-cyan-300 transition-colors" />
                    <Input
                      placeholder="Search doctors, specialties, or conditions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-14 text-base sm:text-lg border border-white/10 focus:border-cyan-300 rounded-2xl bg-white/5 text-slate-100 placeholder:text-slate-500 focus-visible:ring-0"
                    />
                  </div>
                </div>
                <div className="lg:w-80">
                  <Select onValueChange={setSelectedSpecialty} value={selectedSpecialty}>
                    <SelectTrigger className="h-14 border border-white/10 focus:border-blue-300 rounded-2xl bg-white/5 text-slate-100">
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border border-white/10 bg-slate-900/95 text-slate-100">
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
                    className="h-14 px-6 sm:px-8 text-base sm:text-lg bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-600 hover:from-sky-700 hover:via-cyan-700 hover:to-indigo-700 rounded-2xl shadow-lg"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search Doctors
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Doctors grid */}
        {isLoading ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-900/30 border-t-sky-400 mx-auto"></div>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-300/60"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            </div>
            <motion.p
              className="mt-8 text-xl text-slate-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Finding the best doctors for you...
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.075 }}
                whileHover={{ y: -6, scale: 1.015 }}
                className="group"
              >
                <Card className="relative hover:shadow-2xl transition-all duration-500 bg-white/5 backdrop-blur border border-white/10 shadow-xl overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(14,165,233,0.10))] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className="w-20 h-20 bg-gradient-to-br from-sky-600 via-cyan-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl"
                        whileHover={{ scale: 1.06, rotate: 3 }}
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
                        <CardTitle className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {doctor.name}
                        </CardTitle>
                        <CardDescription className="text-sky-300 font-semibold text-lg">
                          {doctor.specialty}
                        </CardDescription>
                        <div className="flex items-center mt-2">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="text-sm text-slate-400 ml-1 font-medium">
                            {doctor.rating?.toFixed?.(1) ?? "4.8"} ({doctor.reviewCount ?? 120} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 relative z-10">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-slate-200">
                        <Star className="w-5 h-5 mr-3 text-cyan-300" />
                        <span className="font-medium">{doctor.qualifications}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-200">
                        <Calendar className="w-5 h-5 mr-3 text-emerald-300" />
                        <span className="font-medium">{doctor.experience} experience</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-200">
                        <MapPin className="w-5 h-5 mr-3 text-sky-300" />
                        <span className="font-medium">{doctor.clinicAddress}</span>
                      </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <div className="flex items-center">
                          <Building className="w-5 h-5 mr-2 text-sky-300" />
                          <span className="text-slate-200 font-medium">Clinic Visit:</span>
                        </div>
                        <span className="font-bold text-emerald-300 text-lg">${doctor.consultationFee}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <Video className="w-5 h-5 mr-2 text-cyan-300" />
                          <span className="text-slate-200 font-medium">Video Call:</span>
                        </div>
                        <span className="font-bold text-emerald-300 text-lg">${doctor.videoConsultationFee}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-400/20 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4 mr-1" />
                        Available Today
                      </Badge>
                      <span className="text-sm text-slate-400 font-medium">Next: 2:30 PM</span>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link href={`/doctor/${doctor.id}`} className="block">
                          <Button
                            className="w-full h-12 bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-600 hover:from-sky-700 hover:via-cyan-700 hover:to-indigo-700 text-white font-semibold shadow-lg rounded-2xl"
                            onClick={() => handleBookAppointment(doctor, "clinic")}
                          >
                            <Building className="w-5 h-5 mr-2" />
                            Book Clinic Visit
                          </Button>
                        </Link>
                      </motion.div>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link href={`/booking/${doctor.id}?type=video`} className="block">
                            <Button
                              variant="outline"
                              className="w-full h-12 border border-white/20 text-slate-100 hover:bg-white/10 bg-transparent rounded-2xl font-semibold"
                              onClick={() => handleBookAppointment(doctor, "video")}
                            >
                              <Video className="w-5 h-5 mr-1" />
                              Video
                            </Button>
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link href={`/booking/${doctor.id}?type=call`} className="block">
                            <Button
                              variant="outline"
                              className="w-full h-12 border border-white/20 text-slate-100 hover:bg-white/10 bg-transparent rounded-2xl font-semibold"
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
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-slate-800 to-slate-700 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No doctors found</h3>
            <p className="text-slate-300 mb-8 text-lg max-w-md mx-auto">
              No doctors found matching your criteria. Try adjusting your search filters.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedSpecialty("all")
                }}
                variant="outline"
                className="border border-white/20 text-slate-100 hover:bg-white/10 px-8 py-3 rounded-2xl font-semibold"
              >
                Clear All Filters
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

function StyleTag() {
  return (
    <style jsx global>{`
      @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(20px, -30px) scale(1.05); }
        66% { transform: translate(-18px, 14px) scale(0.98); }
        100% { transform: translate(0px, 0px) scale(1); }
      }
      .animate-blob { animation: blob 20s infinite; }
      .animation-delay-2000 { animation-delay: 2s; }
      .animation-delay-4000 { animation-delay: 4s; }

      /* Hide horizontal scrollbar for the specialty scroller */
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
  )
}
