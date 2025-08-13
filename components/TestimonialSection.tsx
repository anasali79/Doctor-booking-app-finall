"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote, MapPin, Heart, Clock, Shield } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Software Engineer",
    location: "Mumbai, Maharashtra",
    image: "/professional-headshot.png",
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
    image: "/professional-headshot.png",
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
    image: "/professional-headshot.png",
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
    image: "/professional-headshot.png",
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
    image: "/professional-headshot.png",
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
    image: "/professional-headshot.png",
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
    color: "text-rose-400",
  },
  {
    icon: Shield,
    title: "1000+",
    subtitle: "Verified Doctors",
    color: "text-emerald-400",
  },
  {
    icon: Clock,
    title: "24/7",
    subtitle: "Available Support",
    color: "text-teal-400",
  },
]

function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev >= testimonials.length - 1 ? 0 : prev + 1))
        setIsTransitioning(false)
      }, 150)
    }, 4000)
    return () => clearInterval(timer)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev >= testimonials.length - 1 ? 0 : prev + 1))
      setIsTransitioning(false)
    }, 150)
  }

  const prevSlide = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev <= 0 ? testimonials.length - 1 : prev - 1))
      setIsTransitioning(false)
    }, 150)
  }

  const goToSlide = (i: number) => {
    if (i !== currentIndex) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(i)
        setIsTransitioning(false)
      }, 150)
    }
  }

  // Current testimonial
  const testimonial = testimonials[currentIndex]

  return (
    <section className="relative bg-[#0f1f32] py-16 sm:py-20 lg:py-24">
      {/* subtle radial glow on navy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(650px 420px at 55% 40%, rgba(72, 123, 164, 0.20) 0%, rgba(72,123,164,0.10) 30%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center sm:mb-16">
          <div className="mb-4 inline-flex items-center space-x-2 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm font-medium text-emerald-300">
            <Heart className="h-4 w-4" />
            <span>{"Patient Reviews"}</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{"Our Patients Speak"}</h2>
          <p className="mx-auto max-w-3xl text-lg text-slate-300 sm:text-xl">
            {"Real experiences from thousands of Indians who trust MediCare for their healthcare journey"}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-12 grid grid-cols-3 gap-4 sm:mb-16 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group text-center transition-transform duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div
                className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/70 shadow-lg sm:mb-4 sm:h-16 sm:w-16 ${feature.color}`}
              >
                <feature.icon className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div className="mb-1 text-xl font-bold text-white sm:text-2xl lg:text-3xl">{feature.title}</div>
              <div className="text-xs text-slate-300 sm:text-sm">{feature.subtitle}</div>
            </div>
          ))}
        </div>

        {/* Single Testimonial Card */}
        <div
          className="relative mx-auto max-w-3xl"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          role="region"
          aria-roledescription="carousel"
          aria-label="Testimonials"
        >
          <div className="relative">
            {/* Single Card */}
            <div className="px-4 py-2">
              <Card
                className={`group h-full border-0 bg-slate-800/60 backdrop-blur-sm shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                  isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
                }`}
              >
                <CardContent className="relative p-6 sm:p-8">
                  {/* Floating quote + glow */}
                  <div className="relative mb-6">
                    <Quote className="mx-auto h-10 w-10 text-emerald-300/40 transition-opacity duration-300 group-hover:text-emerald-300/60 sm:h-12 sm:w-12" />
                    <div className="pointer-events-none absolute inset-0 mx-auto h-10 w-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-15 blur-xl sm:h-12 sm:w-12" />
                  </div>

                  {/* Review Text */}
                  <p className="mb-6 text-center italic leading-relaxed text-slate-200 text-lg sm:mb-8">
                    {'"'}
                    {testimonial.text}
                    {'"'}
                  </p>

                  {/* Rating */}
                  <div className="mb-4 flex items-center justify-center sm:mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="mx-0.5 h-5 w-5 animate-pulse fill-yellow-400 text-yellow-400 sm:h-6 sm:w-6"
                        style={{ animationDelay: `${i * 100}ms` }}
                        aria-hidden="true"
                      />
                    ))}
                    <span className="sr-only">{`${testimonial.rating} out of 5 stars`}</span>
                  </div>

                  {/* User Info */}
                  <div className="text-center">
                    <div className="relative mb-4 inline-block">
                   
                      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-30 blur-md transition-opacity duration-300 group-hover:opacity-50" />
                    </div>
                    <h4 className="text-lg font-bold text-white sm:text-xl">{testimonial.name}</h4>
                    <p className="mb-2 text-sm text-slate-300 sm:text-base">{testimonial.role}</p>
                    <div className="mb-2 flex items-center justify-center space-x-1 text-sm text-slate-300">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      <span>{testimonial.location}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <span className="rounded-full bg-slate-800/50 px-3 py-1 text-emerald-300">
                        {testimonial.specialty}
                      </span>
                      <span className="text-slate-500">{"•"}</span>
                      <span className="text-slate-300">{testimonial.date}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              aria-label="Previous"
              className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/70 text-slate-200 shadow-md transition-transform duration-300 hover:scale-110 hover:text-emerald-300 sm:h-12 sm:w-12"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next"
              className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/70 text-slate-200 shadow-md transition-transform duration-300 hover:scale-110 hover:text-emerald-300 sm:h-12 sm:w-12"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="mt-8 flex justify-center space-x-2 sm:mt-12">
            {testimonials.map((_, index) => (
              <button
                key={index}
                aria-label={`Go to slide ${index + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "h-3 w-8 bg-gradient-to-r from-emerald-500 to-teal-500"
                    : "h-3 w-3 bg-slate-700 hover:bg-slate-600"
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center sm:mt-16">
          <div className="inline-flex cursor-pointer items-center space-x-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105">
            <Heart className="h-5 w-5" />
            <span>{"Join 50,000+ Happy Patients"}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export { TestimonialSection }
export default TestimonialSection
