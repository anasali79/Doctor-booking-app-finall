"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote, MapPin, Heart, Shield, Clock } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Software Engineer",
    location: "Mumbai, Maharashtra",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "MediCare ne meri zindagi badal di! Video consultation ke through ghar baithe hi best doctors se mil gaya. Bahut convenient aur professional service hai.",
    specialty: "General Medicine",
    date: "2 weeks ago",
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    role: "Business Owner",
    location: "Delhi, NCR",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "Excellent platform! Appointment booking bilkul easy hai aur doctors bahut experienced hain. Emergency mein bhi turant help mil jaati hai.",
    specialty: "Cardiology",
    date: "1 week ago",
  },
  {
    id: 3,
    name: "Anita Patel",
    role: "Teacher",
    location: "Ahmedabad, Gujarat",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "Meri family ke liye perfect solution hai. Kids ke liye pediatrician se leke elderly parents ke liye specialist tak, sab kuch ek jagah mil jaata hai.",
    specialty: "Pediatrics",
    date: "3 days ago",
  },
  {
    id: 4,
    name: "Vikram Singh",
    role: "IT Professional",
    location: "Bangalore, Karnataka",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "Night shifts ke wajah se regular clinic jaana mushkil tha. MediCare ka 24/7 service aur online prescription system ne life easy kar diya.",
    specialty: "Dermatology",
    date: "5 days ago",
  },
  {
    id: 5,
    name: "Meera Reddy",
    role: "Homemaker",
    location: "Hyderabad, Telangana",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "Pregnancy ke time regular checkups ke liye MediCare use kiya. Doctors bahut caring hain aur Hindi mein bhi explain karte hain. Highly recommended!",
    specialty: "Gynecology",
    date: "1 week ago",
  },
  {
    id: 6,
    name: "Arjun Gupta",
    role: "Student",
    location: "Pune, Maharashtra",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "College ke time budget tight tha, lekin MediCare ke affordable consultation rates ne help ki. Quality healthcare accessible price mein mil gaya.",
    specialty: "General Medicine",
    date: "4 days ago",
  },
]

const features = [
  {
    icon: Heart,
    title: "50,000+",
    subtitle: "Happy Patients",
    color: "text-red-500",
  },
  {
    icon: Shield,
    title: "1000+",
    subtitle: "Verified Doctors",
    color: "text-green-500",
  },
  {
    icon: Clock,
    title: "24/7",
    subtitle: "Available Support",
    color: "text-blue-500",
  },
]

export function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [visibleCards, setVisibleCards] = useState(1)

  useEffect(() => {
    const updateVisibleCards = () => {
      if (window.innerWidth >= 1024) setVisibleCards(3)
      else if (window.innerWidth >= 768) setVisibleCards(2)
      else setVisibleCards(1)
    }

    updateVisibleCards()
    window.addEventListener("resize", updateVisibleCards)
    return () => window.removeEventListener("resize", updateVisibleCards)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = testimonials.length - visibleCards
        return prev >= maxIndex ? 0 : prev + 1
      })
    }, 4000)

    return () => clearInterval(timer)
  }, [isAutoPlaying, visibleCards])

  const nextSlide = () => {
    const maxIndex = testimonials.length - visibleCards
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const prevSlide = () => {
    const maxIndex = testimonials.length - visibleCards
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-orange-50 via-white to-green-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-orange-500 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-green-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-blue-500 rounded-full blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-green-100 px-4 py-2 rounded-full text-sm font-medium text-orange-700 mb-4 border border-orange-200">
            <Heart className="w-4 h-4" />
            <span>Patient Reviews</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-green-600 bg-clip-text text-transparent mb-4 sm:mb-6">
            Our Patients Speak
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real experiences from thousands of Indians who trust MediCare for their healthcare journey
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-12 sm:mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center group hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 ${feature.color} bg-white rounded-full shadow-lg mb-3 sm:mb-4 group-hover:shadow-xl transition-all duration-300`}
              >
                <feature.icon className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{feature.title}</div>
              <div className="text-xs sm:text-sm text-gray-600">{feature.subtitle}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Carousel */}
        <div
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-all duration-700 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
                width: `${(testimonials.length / visibleCards) * 100}%`,
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="px-2 sm:px-4" style={{ width: `${100 / testimonials.length}%` }}>
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 border-0 group hover:-translate-y-2 h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-green-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-6 sm:p-8 relative">
                      {/* Quote Icon */}
                      <div className="relative mb-6">
                        <Quote className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500 mx-auto opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-green-500 w-10 h-10 sm:w-12 sm:h-12 rounded-full blur-xl opacity-20 mx-auto"></div>
                      </div>

                      {/* Review Text */}
                      <p className="text-sm sm:text-base text-gray-700 mb-6 sm:mb-8 leading-relaxed italic font-medium min-h-[80px] sm:min-h-[100px]">
                        "{testimonial.text}"
                      </p>

                      {/* Rating */}
                      <div className="flex items-center justify-center mb-4 sm:mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current mx-0.5 animate-pulse"
                            style={{ animationDelay: `${i * 100}ms` }}
                          />
                        ))}
                      </div>

                      {/* User Info */}
                      <div className="text-center">
                        <div className="relative inline-block mb-4">
                          <img
                            src={testimonial.image || "/placeholder.svg"}
                            alt={testimonial.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover mx-auto border-4 border-gradient-to-r from-orange-400 to-green-400 shadow-lg group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-green-400 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                        </div>

                        <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-1">{testimonial.name}</h4>
                        <p className="text-gray-600 text-xs sm:text-sm mb-2">{testimonial.role}</p>

                        <div className="flex items-center justify-center space-x-1 text-xs text-gray-500 mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{testimonial.location}</span>
                        </div>

                        <div className="flex items-center justify-center space-x-2 text-xs">
                          <span className="bg-gradient-to-r from-orange-100 to-green-100 text-orange-700 px-2 py-1 rounded-full">
                            {testimonial.specialty}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">{testimonial.date}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-gray-700 hover:text-orange-600 hover:scale-110 z-10"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-gray-700 hover:text-orange-600 hover:scale-110 z-10"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 sm:mt-12 space-x-2">
          {Array.from({ length: testimonials.length - visibleCards + 1 }).map((_, index) => (
            <button
              key={index}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "bg-gradient-to-r from-orange-500 to-green-500 w-8 h-3"
                  : "bg-gray-300 hover:bg-gray-400 w-3 h-3"
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-green-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
            <Heart className="w-5 h-5" />
            <span>Join 50,000+ Happy Patients</span>
          </div>
        </div>
      </div>
    </section>
  )
}
