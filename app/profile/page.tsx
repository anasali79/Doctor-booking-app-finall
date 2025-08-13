"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Phone,
  Mail,
  Edit,
  Save,
  X,
  Shield,
  Calendar,
  Star,
  Heart,
  Activity,
  Clock,
  MapPin,
  Camera,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      updateUser(formData)
      setIsEditing(false)
      toast({
        title: "Success! ✅",
        description: "Profile updated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error ❌",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    })
    setIsEditing(false)
  }

  const stats = [
    { icon: Calendar, label: "Appointments", value: "12", color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: Heart, label: "Health Score", value: "95%", color: "text-green-500", bg: "bg-green-500/10" },
    { icon: Activity, label: "Active Days", value: "30", color: "text-purple-500", bg: "bg-purple-500/10" },
    { icon: Star, label: "Rating", value: "4.9", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ]

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-green-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-pink-500 rounded-full blur-2xl animate-pulse delay-3000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header Section */}
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-500/20 backdrop-blur-sm">
              <User className="w-4 h-4" />
              <span>Patient Profile</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent mb-4 sm:mb-6">
              My Profile
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Manage your personal information and track your health journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            {/* Profile Card */}
            <motion.div
              className="xl:col-span-2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardHeader className="relative border-b border-slate-700/50 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4 sm:space-x-6">
                      {/* Profile Avatar */}
                      <motion.div
                        className="relative group cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
                          <span className="text-white text-2xl sm:text-3xl font-bold">
                            {user?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                        <motion.div
                          className="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Camera className="w-4 h-4 text-blue-400" />
                        </motion.div>
                      </motion.div>

                      <div>
                        <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-2">
                          {user?.name || "User"}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified Patient
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
                            <Star className="w-3 h-3 mr-1" />
                            Premium Member
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent backdrop-blur-sm shadow-lg"
                        disabled={isLoading}
                      >
                        {isEditing ? (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </CardHeader>

                <CardContent className="relative p-6 sm:p-8">
                  <AnimatePresence mode="wait">
                    <motion.form
                      key={isEditing ? "editing" : "viewing"}
                      onSubmit={handleSubmit}
                      className="space-y-6 sm:space-y-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <motion.div
                          className="space-y-2"
                          whileHover={{ scale: isEditing ? 1.02 : 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Label htmlFor="name" className="text-slate-300 font-medium">
                            Full Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              id="name"
                              type="text"
                              value={formData.name}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                              disabled={!isEditing || isLoading}
                              className={`pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 transition-all duration-300 ${
                                isEditing
                                  ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                                  : "cursor-default"
                              }`}
                              required
                            />
                          </div>
                        </motion.div>

                        {/* Phone Number */}
                        <motion.div
                          className="space-y-2"
                          whileHover={{ scale: isEditing ? 1.02 : 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Label htmlFor="phone" className="text-slate-300 font-medium">
                            Phone Number
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              disabled={!isEditing || isLoading}
                              className={`pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 transition-all duration-300 ${
                                isEditing
                                  ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                                  : "cursor-default"
                              }`}
                              required
                            />
                          </div>
                        </motion.div>
                      </div>

                      {/* Email Address */}
                      <motion.div
                        className="space-y-2"
                        whileHover={{ scale: isEditing ? 1.02 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Label htmlFor="email" className="text-slate-300 font-medium">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            disabled={!isEditing || isLoading}
                            className={`pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 transition-all duration-300 ${
                              isEditing
                                ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                                : "cursor-default"
                            }`}
                            required
                          />
                        </div>
                      </motion.div>

                      {/* Action Buttons */}
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div
                            className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-slate-700/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                {isLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                  </>
                                )}
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.form>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-400" />
                      Health Stats
                    </CardTitle>
                    <CardDescription className="text-slate-400">Your health journey overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/30 transition-colors duration-300"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                          </div>
                          <span className="text-slate-300 font-medium">{stat.label}</span>
                        </div>
                        <span className="text-white font-bold text-lg">{stat.value}</span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Account Info Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-green-400" />
                      Account Information
                    </CardTitle>
                    <CardDescription className="text-slate-400">Your account details and status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <motion.div
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <User className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-slate-300 font-medium">Account Type</span>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 capitalize">
                        {user?.role || "Patient"}
                      </Badge>
                    </motion.div>

                    <motion.div
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Calendar className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-slate-300 font-medium">Member Since</span>
                      </div>
                      <span className="text-white font-semibold">January 2024</span>
                    </motion.div>

                    <motion.div
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Clock className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="text-slate-300 font-medium">Last Active</span>
                      </div>
                      <span className="text-white font-semibold">Just now</span>
                    </motion.div>

                    <motion.div
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                          <MapPin className="w-4 h-4 text-yellow-400" />
                        </div>
                        <span className="text-slate-300 font-medium">Location</span>
                      </div>
                      <span className="text-white font-semibold">Mumbai, India</span>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
