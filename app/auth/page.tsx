"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { authAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Heart, User, Mail, Phone, Lock, Stethoscope, GraduationCap, MapPin, Clock, Eye, EyeOff } from "lucide-react"
import { ServerStatus } from "@/components/ServerStatus"

// Add this function at the top of the component, after the imports
const testConnection = async () => {
  try {
    const response = await fetch("https://doctor-api-u6mn.onrender.com/doctors", { method: "HEAD" })
    return response.ok
  } catch (error) {
    return false
  }
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isDoctor, setIsDoctor] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialty: "",
    qualifications: "",
    experience: "",
    clinicAddress: "",
  })

  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Update the handleSubmit function to test connection first
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Test connection first
      const isConnected = await testConnection()
      if (!isConnected) {
        throw new Error("Cannot connect to server. Please make sure JSON Server is running on port 3001.")
      }

      if (isLogin) {
        const user = await authAPI.login(formData.email, formData.password, isDoctor ? "doctor" : "patient")
        login(user)
        router.push(isDoctor ? "/doctor/dashboard" : "/")
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        })
      } else {
        const user = await authAPI.signup(formData, isDoctor ? "doctor" : "patient")
        login(user)
        router.push(isDoctor ? "/doctor/dashboard" : "/")
        toast({
          title: "Account created!",
          description: "Your account has been created successfully.",
        })
      }
    } catch (error) {
      console.error("Auth error:", error)
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Authentication failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <>
      {/* Desktop Layout - Split Screen */}
      <div className="hidden lg:flex min-h-screen bg-white">
        {/* Left Side - Welcome Text */}
        <div className="flex-1 bg-white flex items-start justify-center pt-32 p-12 relative overflow-hidden">
          {/* Welcome Text Upper Center */}
          <div className="relative z-10 text-center text-gray-800 animate-fadeInUp">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <span className="text-5xl font-bold text-gray-800">
                Medi<span className="text-blue-500">Care</span>
              </span>
            </div>
            <h2 className="text-4xl font-bold mb-6 text-gray-800">Welcome to MediCare</h2>
            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
              Your trusted healthcare companion. Connect with qualified doctors and manage your health journey with
              ease.
            </p>
          </div>
        </div>

        {/* Right Side - Animated Form */}
        <div className="flex-1 bg-white flex items-center justify-center p-12 relative overflow-hidden">
          <div className="relative z-10 w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8 animate-fadeInUp">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <span className="text-4xl font-bold text-gray-800">
                  Medi<span className="text-blue-500">Care</span>
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{isLogin ? "Welcome Back!" : "Join MediCare"}</h1>
              <p className="text-gray-600">
                {isLogin ? "Sign in to continue your health journey" : "Start your healthcare journey today"}
              </p>
            </div>

            {/* Main Card */}
            <Card className="bg-gray-50 border-gray-200 shadow-2xl animate-fadeInUp animation-delay-200">
              <CardContent className="p-8">
                {/* Role Toggle */}
                <div className="flex items-center justify-center space-x-6 mb-8 p-4 bg-gray-100 rounded-2xl">
                  <div
                    className={`flex items-center space-x-2 transition-all duration-300 ${!isDoctor ? "text-blue-500 scale-110" : "text-gray-500"}`}
                  >
                    <User className="w-5 h-5" />
                    <Label htmlFor="role-switch" className="font-semibold cursor-pointer">
                      Patient
                    </Label>
                  </div>
                  <Switch
                    id="role-switch"
                    checked={isDoctor}
                    onCheckedChange={setIsDoctor}
                    className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-blue-600"
                  />
                  <div
                    className={`flex items-center space-x-2 transition-all duration-300 ${isDoctor ? "text-purple-500 scale-110" : "text-gray-500"}`}
                  >
                    <Stethoscope className="w-5 h-5" />
                    <Label htmlFor="role-switch" className="font-semibold cursor-pointer">
                      Doctor
                    </Label>
                  </div>
                </div>

                {/* Auth Toggle Buttons */}
                <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                      isLogin ? "bg-white text-gray-900 shadow-lg" : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                      !isLogin ? "bg-white text-gray-900 shadow-lg" : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {!isLogin && (
                    <div className="animate-slideInLeft">
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        Full Name
                      </Label>
                      <div className="relative mt-2">
                        <User className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="pl-12 h-14 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="animate-slideInLeft animation-delay-100">
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Email Address
                    </Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-12 h-14 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="animate-slideInLeft animation-delay-200">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">
                        Phone Number
                      </Label>
                      <div className="relative mt-2">
                        <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="pl-12 h-14 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="animate-slideInLeft animation-delay-300">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pl-12 pr-12 h-14 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        placeholder="Enter your password"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && isDoctor && (
                    <div className="space-y-6 animate-slideInLeft animation-delay-400">
                      <div>
                        <Label htmlFor="specialty" className="text-gray-700 font-medium">
                          Medical Specialty
                        </Label>
                        <div className="relative mt-2">
                          <Select onValueChange={(value) => handleInputChange("specialty", value)}>
                            <SelectTrigger className="h-14 bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500 rounded-xl">
                              <SelectValue placeholder="Select your specialty" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200">
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
                      </div>

                      <div>
                        <Label htmlFor="qualifications" className="text-gray-700 font-medium">
                          Qualifications
                        </Label>
                        <div className="relative mt-2">
                          <GraduationCap className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                          <Input
                            id="qualifications"
                            type="text"
                            value={formData.qualifications}
                            onChange={(e) => handleInputChange("qualifications", e.target.value)}
                            className="pl-12 h-14 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                            placeholder="e.g., MD, MBBS, Specialist"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="experience" className="text-gray-700 font-medium">
                          Experience
                        </Label>
                        <div className="relative mt-2">
                          <Clock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                          <Input
                            id="experience"
                            type="text"
                            value={formData.experience}
                            onChange={(e) => handleInputChange("experience", e.target.value)}
                            className="pl-12 h-14 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                            placeholder="e.g., 5 years"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="clinicAddress" className="text-gray-700 font-medium">
                          Clinic Address
                        </Label>
                        <div className="relative mt-2">
                          <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                          <Textarea
                            id="clinicAddress"
                            value={formData.clinicAddress}
                            onChange={(e) => handleInputChange("clinicAddress", e.target.value)}
                            className="pl-12 min-h-[100px] bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl resize-none"
                            placeholder="Enter your clinic address"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className={`w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      isDoctor
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    } shadow-2xl animate-slideInUp animation-delay-500 text-white`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Please wait...</span>
                      </div>
                    ) : (
                      `${isLogin ? "Sign In" : "Create Account"} as ${isDoctor ? "Doctor" : "Patient"}`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <ServerStatus />

            {/* Demo Credentials */}
            <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-200 animate-fadeInUp animation-delay-600">
              <h3 className="font-bold text-gray-800 mb-3 text-center">🚀 Demo Credentials</h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <p className="text-blue-700 font-semibold">👨‍⚕️ Doctor Account</p>
                  <p className="text-gray-700">sarah@example.com / password123</p>
                </div>
                <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                  <p className="text-green-700 font-semibold">🏥 Patient Account</p>
                  <p className="text-gray-700">john@example.com / password123</p>
                </div>
              </div>
            </div>

          </div>
          </div>
        </div>
  

      {/* Mobile Layout - Full Experience */}
      <div className="lg:hidden min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="relative z-10 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 animate-fadeInUp">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <span className="text-4xl font-bold text-gray-800">
                Medi<span className="text-blue-500">Care</span>
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{isLogin ? "Welcome Back!" : "Join MediCare"}</h1>
            <p className="text-gray-600">
              {isLogin ? "Sign in to continue your health journey" : "Start your healthcare journey today"}
            </p>
          </div>

          {/* Main Card */}
          <Card className="bg-gray-50 border-gray-200 shadow-2xl animate-fadeInUp animation-delay-200">
            <CardContent className="p-8">
              {/* Role Toggle */}
              <div className="flex items-center justify-center space-x-6 mb-8 p-4 bg-gray-100 rounded-2xl">
                <div
                  className={`flex items-center space-x-2 transition-all duration-300 ${!isDoctor ? "text-blue-500 scale-110" : "text-gray-500"}`}
                >
                  <User className="w-5 h-5" />
                  <Label htmlFor="role-switch-mobile" className="font-semibold cursor-pointer">
                    Patient
                  </Label>
                </div>
                <Switch
                  id="role-switch-mobile"
                  checked={isDoctor}
                  onCheckedChange={setIsDoctor}
                  className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-blue-600"
                />
                <div
                  className={`flex items-center space-x-2 transition-all duration-300 ${isDoctor ? "text-purple-500 scale-110" : "text-gray-500"}`}
                >
                  <Stethoscope className="w-5 h-5" />
                  <Label htmlFor="role-switch-mobile" className="font-semibold cursor-pointer">
                    Doctor
                  </Label>
                </div>
              </div>

              {/* Auth Toggle Buttons */}
              <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    isLogin ? "bg-white text-gray-900 shadow-lg" : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    !isLogin ? "bg-white text-gray-900 shadow-lg" : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="animate-slideInLeft">
                    <Label htmlFor="name-mobile" className="text-gray-700 font-medium">
                      Full Name
                    </Label>
                    <div className="relative mt-2">
                      <User className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <Input
                        id="name-mobile"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="pl-12 h-14 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="animate-slideInLeft animation-delay-100">
                  <Label htmlFor="email-mobile" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <Input
                      id="email-mobile"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-12 h-14 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="animate-slideInLeft animation-delay-200">
                    <Label htmlFor="phone-mobile" className="text-gray-700 font-medium">
                      Phone Number
                    </Label>
                    <div className="relative mt-2">
                      <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <Input
                        id="phone-mobile"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="pl-12 h-14 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="animate-slideInLeft animation-delay-300">
                  <Label htmlFor="password-mobile" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <Input
                      id="password-mobile"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-12 pr-12 h-14 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      placeholder="Enter your password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && isDoctor && (
                  <div className="space-y-6 animate-slideInLeft animation-delay-400">
                    <div>
                      <Label htmlFor="specialty-mobile" className="text-gray-700 font-medium">
                        Medical Specialty
                      </Label>
                      <div className="relative mt-2">
                        <Select onValueChange={(value) => handleInputChange("specialty", value)}>
                          <SelectTrigger className="h-14 bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500 rounded-xl">
                            <SelectValue placeholder="Select your specialty" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200">
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
                    </div>

                    <div>
                      <Label htmlFor="qualifications-mobile" className="text-gray-700 font-medium">
                        Qualifications
                      </Label>
                      <div className="relative mt-2">
                        <GraduationCap className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <Input
                          id="qualifications-mobile"
                          type="text"
                          value={formData.qualifications}
                          onChange={(e) => handleInputChange("qualifications", e.target.value)}
                          className="pl-12 h-14 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                          placeholder="e.g., MD, MBBS, Specialist"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="experience-mobile" className="text-gray-700 font-medium">
                        Experience
                      </Label>
                      <div className="relative mt-2">
                        <Clock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <Input
                          id="experience-mobile"
                          type="text"
                          value={formData.experience}
                          onChange={(e) => handleInputChange("experience", e.target.value)}
                          className="pl-12 h-14 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                          placeholder="e.g., 5 years"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="clinicAddress-mobile" className="text-gray-700 font-medium">
                        Clinic Address
                      </Label>
                      <div className="relative mt-2">
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <Textarea
                          id="clinicAddress-mobile"
                          value={formData.clinicAddress}
                          onChange={(e) => handleInputChange("clinicAddress", e.target.value)}
                          className="pl-12 min-h-[100px] bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl resize-none"
                          placeholder="Enter your clinic address"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className={`w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    isDoctor
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  } shadow-2xl animate-slideInUp animation-delay-500 text-white`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Please wait...</span>
                    </div>
                  ) : (
                    `${isLogin ? "Sign In" : "Create Account"} as ${isDoctor ? "Doctor" : "Patient"}`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          <ServerStatus />

          {/* Demo Credentials */}
          <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-200 animate-fadeInUp animation-delay-600">
            <h3 className="font-bold text-gray-800 mb-3 text-center">🚀 Demo Credentials</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                <p className="text-blue-700 font-semibold">👨‍⚕️ Doctor Account</p>
                <p className="text-gray-700">sarah@example.com / password123</p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                <p className="text-green-700 font-semibold">🏥 Patient Account</p>
                <p className="text-gray-700">john@example.com / password123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
