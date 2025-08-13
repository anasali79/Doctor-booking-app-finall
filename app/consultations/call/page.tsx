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
import { Phone, Star, Calendar, DollarSign, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function CallConsultationPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get("specialty") || "all")
  const [sortBy, setSortBy] = useState("rating")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDoctors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDoctors = async () => {
    try {
      const doctorsData = await doctorsAPI.getAll()
      // Filter doctors who offer call consultations
      const callConsultationDoctors = doctorsData.filter((doctor) => doctor.consultationType?.includes("call"))
      setDoctors(callConsultationDoctors)
      setFilteredDoctors(callConsultationDoctors)
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
    let filtered = [...doctors]

    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.about.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedSpecialty !== "all") {
      filtered = filtered.filter((doctor) => doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase())
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "experience":
          return Number.parseInt(b.experience) - Number.parseInt(a.experience)
        case "fee":
          return a.videoConsultationFee - b.videoConsultationFee
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedSpecialty, sortBy, doctors])

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(1200px_800px_at_80%_-10%,#581c87_0%,transparent_60%),radial-gradient(900px_600px_at_-10%_30%,#0ea5e9_0%,transparent_55%),linear-gradient(to_bottom,#020617,70%,#000)] text-gray-200">
        {/* Animated gradient blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute left-[-10%] top-[-10%] h-[40vh] w-[40vh] rounded-full bg-fuchsia-600/20 blur-3xl"
            style={{ animation: "pulse 9s ease-in-out infinite" }}
          />
          <div
            className="absolute right-[-10%] top-[10%] h-[45vh] w-[45vh] rounded-full bg-cyan-500/20 blur-3xl"
            style={{ animation: "pulse 11s ease-in-out infinite", animationDelay: "1.2s" }}
          />
          <div
            className="absolute bottom-[-15%] left-[15%] h-[50vh] w-[50vh] rounded-full bg-violet-700/20 blur-3xl"
            style={{ animation: "pulse 13s ease-in-out infinite", animationDelay: "0.6s" }}
          />
        </div>

        {/* Fixed Navbar with blur */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-black/30">
          <ModernNavbar />
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4 text-white">
              <Phone className="w-12 h-12 text-fuchsia-400 mr-4" />
              <h1 className="text-4xl font-bold">Call Consultation</h1>
            </div>
            <p className="text-gray-300 text-lg">Get medical advice through secure phone consultations</p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8 border-white/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <Input
                    placeholder="Search by doctor name, specialty, or condition..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent text-white placeholder:text-white/60 border-white/20 focus-visible:ring-white/30 focus-visible:ring-offset-0"
                  />
                </div>
                <div>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger className="h-12 bg-transparent text-white border-white/20 focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border border-white/10 text-white">
                      <SelectItem value="all" className="focus:bg-white/10">
                        All Specialties
                      </SelectItem>
                      <SelectItem value="cardiology" className="focus:bg-white/10">
                        Cardiology
                      </SelectItem>
                      <SelectItem value="dermatology" className="focus:bg-white/10">
                        Dermatology
                      </SelectItem>
                      <SelectItem value="neurology" className="focus:bg-white/10">
                        Neurology
                      </SelectItem>
                      <SelectItem value="orthopedics" className="focus:bg-white/10">
                        Orthopedics
                      </SelectItem>
                      <SelectItem value="pediatrics" className="focus:bg-white/10">
                        Pediatrics
                      </SelectItem>
                      <SelectItem value="psychiatry" className="focus:bg-white/10">
                        Psychiatry
                      </SelectItem>
                      <SelectItem value="general medicine" className="focus:bg-white/10">
                        General Medicine
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-12 bg-transparent text-white border-white/20 focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border border-white/10 text-white">
                      <SelectItem value="rating" className="focus:bg-white/10">
                        Highest Rated
                      </SelectItem>
                      <SelectItem value="experience" className="focus:bg-white/10">
                        Most Experienced
                      </SelectItem>
                      <SelectItem value="fee" className="focus:bg-white/10">
                        Lowest Fee
                      </SelectItem>
                      <SelectItem value="name" className="focus:bg-white/10">
                        Name A-Z
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-400 mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading doctors...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <Card className="text-center py-12 border-white/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5">
              <CardContent>
                <Phone className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No doctors found</h3>
                <p className="text-gray-300">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-300">
                  Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""} available for phone
                  consultation
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredDoctors.map((doctor) => (
                  <Card
                    key={doctor.id}
                    className="group relative overflow-hidden border border-white/10 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5 hover:border-white/20 transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="text-center">
                        <img
                          src={doctor.image || "/placeholder.svg?height=80&width=80&query=doctor%20profile%20photo"}
                          alt={doctor.name}
                          className="w-20 h-20 rounded-full object-cover mx-auto mb-4 ring-2 ring-white/15"
                        />
                        <h3 className="text-xl font-semibold text-white mb-1">{doctor.name}</h3>
                        <p className="text-fuchsia-300 font-medium mb-1">{doctor.specialty}</p>
                        <p className="text-sm text-gray-300 mb-3">{doctor.qualifications}</p>

                        <div className="flex items-center justify-center mb-4">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="ml-1 text-sm font-medium text-white">{doctor.rating}</span>
                          <span className="ml-1 text-sm text-gray-400">({doctor.reviewCount})</span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-center text-sm text-gray-300">
                            <Calendar className="w-4 h-4 mr-2 text-white/70" />
                            {doctor.experience} experience
                          </div>
                          <div className="flex items-center justify-center text-sm text-gray-300">
                            <DollarSign className="w-4 h-4 mr-2 text-white/70" />
                            Phone consultation: ${doctor.videoConsultationFee}
                          </div>
                          <div className="flex items-center justify-center text-sm text-gray-300">
                            <Clock className="w-4 h-4 mr-2 text-white/70" />
                            Available today
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-300/90 line-clamp-2">{doctor.about}</p>
                        </div>

                        <div className="flex justify-center mb-4">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-400/20"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Call Available
                          </Badge>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Link href={`/doctor/${doctor.id}`} className="w-full">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
                            >
                              View Profile
                            </Button>
                          </Link>
                          <Link href={`/booking/${doctor.id}?type=call`} className="w-full">
                            <Button
                              size="sm"
                              className="w-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white hover:opacity-90"
                            >
                              Book Phone Call
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                    {/* Subtle card glow on hover */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(600px_300px_at_50%_-10%,rgba(168,85,247,0.12),transparent)]" />
                  </Card>
                ))}
              </div>
            </>
          )}
        </main>

        <footer className="relative z-10">
          <ModernFooter />
        </footer>
      </div>
    </ProtectedRoute>
  )
}
