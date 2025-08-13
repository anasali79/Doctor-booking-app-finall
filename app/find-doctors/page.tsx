"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ModernNavbar } from "@/components/ModernNavbar"
import { ModernFooter } from "@/components/ModernFooter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { doctorsAPI, type Doctor } from "@/lib/api"
import { Search, MapPin, Star, Calendar, IndianRupee, Video, Phone, Building, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function FindDoctorsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get("specialty") || "all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadDoctors()
  }, [])

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

    // Search by name, specialty, or condition
    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.about.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by specialty
    if (selectedSpecialty !== "all") {
      filtered = filtered.filter((doctor) => doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase())
    }

    // Filter by location
    if (selectedLocation !== "all") {
      filtered = filtered.filter((doctor) =>
        doctor.clinicAddress.toLowerCase().includes(selectedLocation.toLowerCase()),
      )
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "experience":
          return Number.parseInt(b.experience) - Number.parseInt(a.experience)
        case "fee":
          return a.consultationFee - b.consultationFee
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredDoctors(filtered)
  }

  useEffect(() => {
    handleSearch()
  }, [searchTerm, selectedSpecialty, selectedLocation, sortBy, doctors])

  const getAvailableConsultationTypes = (doctor: Doctor) => {
    return doctor.consultationType || ["clinic"]
  }

  const formatIndianTime = () => {
    return new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <ModernNavbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <motion.div
            className="text-center mb-6 sm:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Find the Right Doctor
            </h1>
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto px-4">
              Search and book appointments with qualified healthcare professionals across India
            </p>
            <p className="text-sm text-blue-600 mt-2">Current time: {formatIndianTime()} IST</p>
          </motion.div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 sm:mb-8"
          >
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-4 sm:p-6">
                {/* Mobile Search */}
                <div className="block lg:hidden space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search doctors, specialties, conditions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full h-12 text-base"
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    {showFilters ? "Hide Filters" : "Show Filters"}
                  </Button>

                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                          <SelectTrigger className="h-12 text-black">
                            <SelectValue placeholder="Select Specialty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Specialties</SelectItem>
                            <SelectItem value="cardiology">Cardiology</SelectItem>
                            <SelectItem value="dermatology">Dermatology</SelectItem>
                            <SelectItem value="neurology">Neurology</SelectItem>
                            <SelectItem value="orthopedics">Orthopedics</SelectItem>
                            <SelectItem value="pediatrics">Pediatrics</SelectItem>
                            <SelectItem value="psychiatry">Psychiatry</SelectItem>
                            <SelectItem value="general medicine">General Medicine</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                          <SelectTrigger className="h-12 text-black">
                            <SelectValue placeholder="Select City" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            <SelectItem value="mumbai">Mumbai</SelectItem>
                            <SelectItem value="delhi">Delhi</SelectItem>
                            <SelectItem value="bangalore">Bangalore</SelectItem>
                            <SelectItem value="chennai">Chennai</SelectItem>
                            <SelectItem value="kolkata">Kolkata</SelectItem>
                            <SelectItem value="hyderabad">Hyderabad</SelectItem>
                            <SelectItem value="pune">Pune</SelectItem>
                            <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="h-12 text-black">
                            <SelectValue placeholder="Sort By" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rating">Highest Rated</SelectItem>
                            <SelectItem value="experience">Most Experienced</SelectItem>
                            <SelectItem value="fee">Lowest Fee</SelectItem>
                            <SelectItem value="name">Name A-Z</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Desktop Search */}
                <div className="hidden lg:grid lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search doctors, specialties, conditions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>

                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger className="h-12 text-black">
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="dermatology">Dermatology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="psychiatry">Psychiatry</SelectItem>
                      <SelectItem value="general medicine">General Medicine</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="h-12 text-black">
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="bangalore">Bangalore</SelectItem>
                      <SelectItem value="chennai">Chennai</SelectItem>
                      <SelectItem value="kolkata">Kolkata</SelectItem>
                      <SelectItem value="hyderabad">Hyderabad</SelectItem>
                      <SelectItem value="pune">Pune</SelectItem>
                      <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-12 text-black">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="experience">Most Experienced</SelectItem>
                      <SelectItem value="fee">Lowest Fee</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          {isLoading ? (
            <motion.div className="text-center py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="relative mx-auto w-16 h-16 mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
              </div>
              <p className="text-lg text-gray-600">Finding the best doctors for you...</p>
            </motion.div>
          ) : filteredDoctors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-center py-16 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent>
                  <Search className="w-20 h-20 mx-auto text-gray-400 mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">No doctors found</h3>
                  <p className="text-gray-600 text-lg">Try adjusting your search criteria or browse all doctors</p>
                  <Button
                    className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedSpecialty("all")
                      setSelectedLocation("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <>
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-gray-600 text-base sm:text-lg">
                  Found <span className="font-semibold text-blue-600">{filteredDoctors.length}</span> doctor
                  {filteredDoctors.length !== 1 ? "s" : ""} for you
                </p>
              </motion.div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {filteredDoctors.map((doctor, index) => (
                  <motion.div
                    key={doctor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                          <motion.img
                            src={doctor.image || "/placeholder.svg?height=80&width=80&text=Doctor"}
                            alt={doctor.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto sm:mx-0 border-4 border-blue-100"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                          />
                          <div className="flex-1 text-center sm:text-left min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                              <div className="mb-2 sm:mb-0">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{doctor.name}</h3>
                                <p className="text-blue-600 font-semibold text-sm sm:text-base">{doctor.specialty}</p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">{doctor.qualifications}</p>
                              </div>
                              <div className="flex items-center justify-center sm:justify-end">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="ml-1 text-sm font-semibold">{doctor.rating}</span>
                                <span className="ml-1 text-xs text-gray-500">({doctor.reviewCount})</span>
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex items-center justify-center sm:justify-start text-xs sm:text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{doctor.experience} experience</span>
                              </div>
                              <div className="flex items-center justify-center sm:justify-start text-xs sm:text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{doctor.clinicAddress.split(",")[0]}</span>
                              </div>
                              <div className="flex items-center justify-center sm:justify-start text-xs sm:text-sm text-gray-600">
                                <IndianRupee className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>Consultation: ₹{doctor.consultationFee}</span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 text-center sm:text-left">
                                {doctor.about}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                              <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2">
                                {getAvailableConsultationTypes(doctor).map((type) => (
                                  <Badge key={type} variant="secondary" className="text-xs px-2 py-1">
                                    {type === "clinic" && <Building className="w-3 h-3 mr-1" />}
                                    {type === "video" && <Video className="w-3 h-3 mr-1" />}
                                    {type === "call" && <Phone className="w-3 h-3 mr-1" />}
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </Badge>
                                ))}
                              </div>
                              <Link href={`/doctor/${doctor.id}`} className="w-full sm:w-auto">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg">
                                    View Profile
                                  </Button>
                                </motion.div>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>

        <ModernFooter />
      </div>
    </ProtectedRoute>
  )
}
