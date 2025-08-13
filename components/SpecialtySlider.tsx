"use client"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

interface SpecialtySliderProps {
  title: string
  onSpecialtySelect: (specialty: string) => void
}

export function SpecialtySlider({ title, onSpecialtySelect }: SpecialtySliderProps) {
  const specialties = [
    {
      name: "Cardiology",
      color: "from-red-500 via-pink-500 to-rose-500",
      bgColor: "from-red-50 to-pink-50",
      description: "Heart & Cardiovascular",
      svg: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
    },
    {
      name: "Neurology",
      color: "from-purple-500 via-indigo-500 to-blue-500",
      bgColor: "from-purple-50 to-indigo-50",
      description: "Brain & Nervous System",
      svg: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.41 0 8 3.59 8 8 0 1.85-.63 3.55-1.69 4.9z" />
        </svg>
      ),
    },
    {
      name: "Pediatrics",
      color: "from-blue-500 via-cyan-500 to-teal-500",
      bgColor: "from-blue-50 to-cyan-50",
      description: "Children's Health",
      svg: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          <circle cx="12" cy="8" r="2" />
        </svg>
      ),
    },
    {
      name: "Dermatology",
      color: "from-green-500 via-emerald-500 to-teal-500",
      bgColor: "from-green-50 to-emerald-50",
      description: "Skin & Beauty",
      svg: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      name: "Orthopedics",
      color: "from-orange-500 via-amber-500 to-yellow-500",
      bgColor: "from-orange-50 to-amber-50",
      description: "Bones & Joints",
      svg: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
          <path d="M15.5 1h-2c-1.1 0-2 .9-2 2v7.5c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zM10.5 11h-2c-1.1 0-2 .9-2 2v7.5c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V13c0-1.1-.9-2-2-2z" />
        </svg>
      ),
    },
    {
      name: "General Medicine",
      color: "from-teal-500 via-green-500 to-lime-500",
      bgColor: "from-teal-50 to-green-50",
      description: "Primary Care",
      svg: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
          <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
        </svg>
      ),
    },
    {
      name: "Psychiatry",
      color: "from-pink-500 via-rose-500 to-red-500",
      bgColor: "from-pink-50 to-rose-50",
      description: "Mental Health",
      svg: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {title}
          </motion.h2>
          <motion.p
            className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Choose from our wide range of medical specialties with expert doctors
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {specialties.map((specialty, index) => (
            <motion.div
              key={specialty.name}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                y: -8,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.95 }}
              className="group"
            >
              <Card
                className="hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white/80 backdrop-blur-sm overflow-hidden relative"
                onClick={() => onSpecialtySelect(specialty.name.toLowerCase())}
              >
                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${specialty.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                ></div>

                <CardContent className="p-4 md:p-6 text-center relative z-10">
                  <motion.div
                    className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${specialty.color} rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    whileHover={{
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.5 },
                    }}
                  >
                    <div className="text-white group-hover:scale-110 transition-transform duration-300">
                      {specialty.svg}
                    </div>
                  </motion.div>

                  <motion.h3
                    className="font-bold text-gray-900 mb-2 text-sm md:text-base group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    {specialty.name}
                  </motion.h3>

                  <motion.p
                    className="text-xs md:text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                  >
                    {specialty.description}
                  </motion.p>
                </CardContent>

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom decorative line */}
        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </motion.div>
      </div>
    </section>
  )
}
