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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDoctors = async () => {
    try {
      const doctorsData = await doctorsAPI.getAll()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedSpecialty, sortBy, doctors])

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0b0f1a] via-[#0a1018] to-[#090d12] text-white">
        {/* Animated gradient blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-blob" />
          <div className="absolute top-1/3 -right-16 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-24 left-1/3 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Fixed, blurred navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-black/30">
          <ModernNavbar />
        </header>

        {/* Page content */}
        <main className="pt-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mb-4 flex items-center justify-center">
                <Video className="mr-4 h-12 w-12 text-emerald-400" />
                <h1 className="text-4xl font-bold tracking-tight text-white">Video Consultation</h1>
              </div>
              <p className="text-base text-white/70">Connect with doctors through secure video calls from anywhere</p>
            </div>

            {/* Search and Filters */}
            <Card className="mb-8 border-white/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="lg:col-span-2">
                    <Input
                      placeholder="Search by doctor name, specialty, or condition..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/5 text-white placeholder:text-white/50 border-white/10 focus:border-emerald-400/40 focus-visible:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                      <SelectTrigger className="h-12 bg-white/5 text-white border-white/10 focus:border-emerald-400/40 focus:ring-0">
                        <SelectValue placeholder="All Specialties" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0c141f] text-white border border-white/10">
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
                      <SelectTrigger className="h-12 bg-white/5 text-white border-white/10 focus:border-emerald-400/40 focus:ring-0">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0c141f] text-white border border-white/10">
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
              <div className="py-12 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500" />
                <p className="mt-4 text-white/70">Loading doctors...</p>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <Card className="border-white/10 bg-white/5 py-12 text-center backdrop-blur supports-[backdrop-filter]:bg-white/5">
                <CardContent>
                  <Video className="mx-auto mb-4 h-16 w-16 text-white/40" />
                  <h3 className="mb-2 text-xl font-semibold text-white">No doctors found</h3>
                  <p className="text-white/70">Try adjusting your search criteria</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-white/70">
                    Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""} available for video
                    consultation
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {filteredDoctors.map((doctor) => (
                    <Card
                      key={doctor.id}
                      className="border-white/10 bg-white/5 backdrop-blur transition-all hover:border-white/20 supports-[backdrop-filter]:bg-white/5"
                    >
                      <CardContent className="p-6">
                        <div className="text-center">
                          <img
                            src={
                              doctor.image ||
                              "/placeholder.svg?height=80&width=80&query=circular%20doctor%20avatar" ||
                              "/placeholder.svg"
                            }
                            alt={doctor.name}
                            className="mx-auto mb-4 h-20 w-20 rounded-full object-cover ring-1 ring-white/15"
                          />
                          <h3 className="mb-1 text-xl font-semibold text-white">{doctor.name}</h3>
                          <p className="mb-1 font-medium text-emerald-300">{doctor.specialty}</p>
                          <p className="mb-3 text-sm text-white/70">{doctor.qualifications}</p>

                          <div className="mb-4 flex items-center justify-center text-white">
                            <Star className="h-4 w-4 fill-current text-yellow-400" />
                            <span className="ml-1 text-sm font-medium">{doctor.rating}</span>
                            <span className="ml-1 text-sm text-white/60">({doctor.reviewCount})</span>
                          </div>

                          <div className="mb-4 space-y-2">
                            <div className="flex items-center justify-center text-sm text-white/70">
                              <Calendar className="mr-2 h-4 w-4" />
                              {doctor.experience} experience
                            </div>
                            <div className="flex items-center justify-center text-sm text-white/70">
                              <DollarSign className="mr-2 h-4 w-4" />
                              Video consultation: ${doctor.videoConsultationFee}
                            </div>
                            <div className="flex items-center justify-center text-sm text-white/70">
                              <Clock className="mr-2 h-4 w-4" />
                              Available today
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="line-clamp-2 text-sm text-white/70">{doctor.about}</p>
                          </div>

                          <div className="mb-4 flex justify-center">
                            <Badge className="border border-emerald-400/20 bg-emerald-500/15 text-emerald-300 text-xs">
                              <Video className="mr-1 h-3 w-3" />
                              Video Available
                            </Badge>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Link href={`/doctor/${doctor.id}`} className="w-full">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
                              >
                                View Profile
                              </Button>
                            </Link>
                            <Link href={`/booking/${doctor.id}?type=video`} className="w-full">
                              <Button size="sm" className="w-full bg-emerald-500 text-black hover:bg-emerald-400">
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
        </main>

        <footer className="border-t border-white/10">
          <ModernFooter />
        </footer>
      </div>

      {/* Local keyframes for animated blobs */}
      <style jsx>{`
        .animate-blob {
          animation: blob 20s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(20px, -30px) scale(1.05);
          }
          66% {
            transform: translate(-25px, 20px) scale(0.98);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
      `}</style>
    </ProtectedRoute>
  )
}
