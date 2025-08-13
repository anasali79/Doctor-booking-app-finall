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
import { Video, Star, Calendar, DollarSign, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function VideoConsultationPage() {
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
  }, [])

  const loadDoctors = async () => {
    try {
      const doctorsData = await doctorsAPI.getAll()
      // Filter doctors who offer video consultations
      const videoConsultationDoctors = doctorsData.filter((doctor) => doctor.consultationType?.includes("video"))
      setDoctors(videoConsultationDoctors)
      setFilteredDoctors(videoConsultationDoctors)
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
  }, [searchTerm, selectedSpecialty, sortBy, doctors])

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="min-h-screen bg-gray-50">
        <ModernNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Video className="w-12 h-12 text-green-600 mr-4" />
              <h1 className="text-4xl font-bold text-gray-900">Video Consultation</h1>
            </div>
            <p className="text-gray-600 text-lg">Connect with doctors through secure video calls from anywhere</p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <Input
                    placeholder="Search by doctor name, specialty, or condition..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
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
                </div>
                <div>
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
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading doctors...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""} available for video
                  consultation
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <img
                          src={doctor.image || "/placeholder.svg"}
                          alt={doctor.name}
                          className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                        />
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{doctor.name}</h3>
                        <p className="text-green-600 font-medium mb-1">{doctor.specialty}</p>
                        <p className="text-sm text-gray-600 mb-3">{doctor.qualifications}</p>

                        <div className="flex items-center justify-center mb-4">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm font-medium">{doctor.rating}</span>
                          <span className="ml-1 text-sm text-gray-500">({doctor.reviewCount})</span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {doctor.experience} experience
                          </div>
                          <div className="flex items-center justify-center text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Video consultation: ${doctor.videoConsultationFee}
                          </div>
                          <div className="flex items-center justify-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            Available today
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-600 line-clamp-2">{doctor.about}</p>
                        </div>

                        <div className="flex justify-center mb-4">
                          <Badge variant="secondary" className="text-xs">
                            <Video className="w-3 h-3 mr-1" />
                            Video Available
                          </Badge>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Link href={`/doctor/${doctor.id}`} className="w-full">
                            <Button variant="outline" size="sm" className="w-full bg-transparent">
                              View Profile
                            </Button>
                          </Link>
                          <Link href={`/booking/${doctor.id}?type=video`} className="w-full">
                            <Button size="sm" className="w-full">
                              Book Video Call
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
