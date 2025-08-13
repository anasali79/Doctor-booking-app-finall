"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ModernNavbar } from "@/components/ModernNavbar"
import { ModernFooter } from "@/components/ModernFooter"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { doctorsAPI, type Doctor } from "@/lib/api"
import { Star, MapPin, Calendar, Clock, Video, Phone, Building, Award, Users, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"

export default function DoctorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params?.id) {
      loadDoctor(params.id as string)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id])

  const loadDoctor = async (id: string) => {
    try {
      const doctorData = await doctorsAPI.getById(id)
      setDoctor(doctorData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load doctor profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookAppointment = (consultationType: string) => {
    if (!doctor) return
    router.push(`/booking/${doctor.id}?type=${consultationType}`)
  }

  const HeaderBackground = () => (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(56,189,248,0.15),rgba(124,58,237,0.06),rgba(0,0,0,0))]" />
      <motion.div
        aria-hidden
        className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl -z-10"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute top-32 -right-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl -z-10"
        animate={{ scale: [1.05, 1, 1.05] }}
        transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
    </>
  )

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["patient"]}>
        <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-[#0B0B10] via-[#0E0E14] to-[#0B0B10] text-white">
          <HeaderBackground />
          <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur">
            <ModernNavbar />
          </header>
          <main className="pt-20">
            <div className="max-w-4xl mx-auto px-4 py-14">
              <div className="text-center py-16">
                <div className="mx-auto h-14 w-14 animate-spin rounded-full border-2 border-cyan-400/30 border-t-fuchsia-500" />
                <p className="mt-6 text-white/70">Loading doctor profile...</p>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (!doctor) {
    return (
      <ProtectedRoute allowedRoles={["patient"]}>
        <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-[#0B0B10] via-[#0E0E14] to-[#0B0B10] text-white">
          <HeaderBackground />
          <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur">
            <ModernNavbar />
          </header>
          <main className="pt-20">
            <div className="max-w-4xl mx-auto px-4 py-10">
              <Card className="bg-white/5 border-white/10 backdrop-blur">
                <CardContent className="py-10 text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">Doctor not found</h3>
                  <p className="text-white/70 mb-6">The doctor profile you're looking for doesn't exist.</p>
                  <Button
                    onClick={() => router.push("/find-doctors")}
                    className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-600 hover:to-cyan-600 text-white"
                  >
                    Back to Search
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-[#0B0B10] via-[#0E0E14] to-[#0B0B10] text-white">
        <HeaderBackground />
        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur">
          <ModernNavbar />
        </header>

        <main className="pt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back */}
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="border-white/15 text-white/80 hover:bg-white/10 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>

            {/* Doctor Header */}
            <Card className="mb-8 bg-white/5 border-white/10 backdrop-blur shadow-xl">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
                  <Image
                    src={doctor.image || "/placeholder.svg?height=128&width=128&query=doctor%20portrait"}
                    alt={doctor.name}
                    width={128}
                    height={128}
                    unoptimized
                    className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover ring-2 ring-white/10"
                  />
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold mb-2">{doctor.name}</h1>
                    <p className="text-lg bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent font-semibold mb-2">
                      {doctor.specialty}
                    </p>
                    <p className="text-white/70 mb-4">{doctor.qualifications}</p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="font-semibold">{doctor.rating}</span>
                        <span className="text-white/60 ml-1">({doctor.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center text-white/80">
                        <Award className="w-5 h-5 mr-1" />
                        {doctor.experience} experience
                      </div>
                      <div className="flex items-center text-white/80">
                        <Users className="w-5 h-5 mr-1" />
                        {doctor.reviewCount}+ patients treated
                      </div>
                    </div>

                    <div className="flex items-center justify-center md:justify-start text-white/80 mb-6">
                      <MapPin className="w-5 h-5 mr-2" />
                      {doctor.clinicAddress}
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                      {doctor.consultationType?.map((type) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="bg-white/10 text-white border-white/20 hover:bg-white/15"
                        >
                          {type === "clinic" && <Building className="w-3 h-3 mr-1" />}
                          {type === "video" && <Video className="w-3 h-3 mr-1" />}
                          {type === "call" && <Phone className="w-3 h-3 mr-1" />}
                          {type.charAt(0).toUpperCase() + type.slice(1)} Available
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="about" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 rounded-xl p-1">
                    <TabsTrigger
                      value="about"
                      className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 rounded-lg"
                    >
                      About
                    </TabsTrigger>
                    <TabsTrigger
                      value="availability"
                      className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 rounded-lg"
                    >
                      Availability
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviews"
                      className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 rounded-lg"
                    >
                      Reviews
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="about" className="space-y-6 mt-4">
                    <Card className="bg-white/5 border-white/10 backdrop-blur">
                      <CardHeader>
                        <CardTitle>About Dr. {doctor.name.split(" ").pop()}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/80 leading-relaxed">{doctor.about}</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 backdrop-blur">
                      <CardHeader>
                        <CardTitle>Qualifications & Experience</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold">Education</h4>
                            <p className="text-white/80">{doctor.qualifications}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">Experience</h4>
                            <p className="text-white/80">
                              {doctor.experience} in {doctor.specialty}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold">Specialization</h4>
                            <p className="text-white/80">{doctor.specialty}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="availability" className="space-y-6 mt-4">
                    <Card className="bg-white/5 border-white/10 backdrop-blur">
                      <CardHeader>
                        <CardTitle>Clinic Availability</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {doctor.availability?.clinic?.map((day) => (
                            <div key={day} className="flex justify-between items-center py-2 border-b border-white/10">
                              <span className="font-medium">{day}</span>
                              <div className="flex flex-wrap gap-2">
                                {doctor.timeSlots?.slice(0, 3).map((time) => (
                                  <Badge key={time} variant="outline" className="border-white/20 text-white/80">
                                    {time}
                                  </Badge>
                                ))}
                                {doctor.timeSlots && doctor.timeSlots.length > 3 && (
                                  <Badge variant="outline" className="border-white/20 text-white/80">
                                    +{doctor.timeSlots.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 backdrop-blur">
                      <CardHeader>
                        <CardTitle>Online Availability</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {doctor.availability?.online?.map((day) => (
                            <div key={day} className="flex justify-between items-center py-2 border-b border-white/10">
                              <span className="font-medium">{day}</span>
                              <div className="flex flex-wrap gap-2">
                                {doctor.timeSlots?.slice(0, 3).map((time) => (
                                  <Badge key={time} variant="outline" className="border-white/20 text-white/80">
                                    {time}
                                  </Badge>
                                ))}
                                {doctor.timeSlots && doctor.timeSlots.length > 3 && (
                                  <Badge variant="outline" className="border-white/20 text-white/80">
                                    +{doctor.timeSlots.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-6 mt-4">
                    <Card className="bg-white/5 border-white/10 backdrop-blur">
                      <CardHeader>
                        <CardTitle>Patient Reviews</CardTitle>
                        <CardDescription className="text-white/60">
                          Based on {doctor.reviewCount} verified patient reviews
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Sample reviews */}
                          <div className="border-b border-white/10 pb-4">
                            <div className="flex items-center mb-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                ))}
                              </div>
                              <span className="ml-2 text-sm text-white/60">John D. • 2 days ago</span>
                            </div>
                            <p className="text-white/80">
                              Excellent doctor! Very thorough and caring. Highly recommend.
                            </p>
                          </div>
                          <div className="border-b border-white/10 pb-4">
                            <div className="flex items-center mb-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                ))}
                              </div>
                              <span className="ml-2 text-sm text-white/60">Sarah M. • 1 week ago</span>
                            </div>
                            <p className="text-white/80">
                              Great experience. The doctor was very professional and explained everything clearly.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Booking Sidebar */}
              <div className="space-y-6">
                <Card className="bg-white/5 border-white/10 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Book Appointment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {doctor.consultationType?.includes("clinic") && (
                      <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Building className="w-5 h-5 mr-2 text-fuchsia-400" />
                            <span className="font-medium">Clinic Visit</span>
                          </div>
                          <span className="font-semibold text-emerald-400">${doctor.consultationFee}</span>
                        </div>
                        <p className="text-sm text-white/70 mb-3">In-person consultation at clinic</p>
                        <Button
                          className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-600 hover:to-cyan-600"
                          onClick={() => handleBookAppointment("clinic")}
                        >
                          Book Clinic Visit
                        </Button>
                      </div>
                    )}

                    {doctor.consultationType?.includes("video") && (
                      <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Video className="w-5 h-5 mr-2 text-cyan-400" />
                            <span className="font-medium">Video Call</span>
                          </div>
                          <span className="font-semibold text-emerald-400">${doctor.videoConsultationFee}</span>
                        </div>
                        <p className="text-sm text-white/70 mb-3">Online video consultation</p>
                        <Button
                          className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-600 hover:to-cyan-600"
                          onClick={() => handleBookAppointment("video")}
                        >
                          Book Video Call
                        </Button>
                      </div>
                    )}

                    {doctor.consultationType?.includes("call") && (
                      <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Phone className="w-5 h-5 mr-2 text-violet-400" />
                            <span className="font-medium">Phone Call</span>
                          </div>
                          <span className="font-semibold text-emerald-400">${doctor.videoConsultationFee}</span>
                        </div>
                        <p className="text-sm text-white/70 mb-3">Audio consultation via phone</p>
                        <Button
                          className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-600 hover:to-cyan-600"
                          onClick={() => handleBookAppointment("call")}
                        >
                          Book Phone Call
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Quick Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-white/80">
                      <Clock className="w-4 h-4 mr-2 text-white/60" />
                      <span className="text-sm">Response time: Within 2 hours</span>
                    </div>
                    <div className="flex items-center text-white/80">
                      <Calendar className="w-4 h-4 mr-2 text-white/60" />
                      <span className="text-sm">Next available: Today</span>
                    </div>
                    <div className="flex items-center text-white/80">
                      <Users className="w-4 h-4 mr-2 text-white/60" />
                      <span className="text-sm">{doctor.reviewCount}+ patients treated</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Explore more</CardTitle>
                    <CardDescription className="text-white/60">
                      Find other specialists related to {doctor.specialty}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/find-doctors" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        Browse Doctors
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <ModernFooter />
        </main>
      </div>
    </ProtectedRoute>
  )
}
