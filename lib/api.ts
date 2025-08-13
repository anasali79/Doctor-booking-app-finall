interface Medicine {
  name: string
  dosage: string
  duration: string
  notes: string
  frequency: string
}

export interface Prescription {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  datePrescribed: string
  timePrescribed?: string
  medicines: Medicine[]
  generalNotes?: string
  patientName: string // Added for easier display
  doctorName: string // Added for easier display
  symptoms?: string
  diagnosis?: string
  // New fields for detailed prescription card
  vitals?: {
    temperature?: string
    bp?: string
    pulse?: string
  }
  testsRecommended?: string // Changed to string for simplicity in form, can be comma-separated
  followUpDate?: string
  doctorSignatureText?: string // For digital signature representation (doctor's name)
}

// Existing interfaces and types
export interface Doctor {
  id: string
  name: string
  email: string
  phone: string
  specialty: string
  qualifications: string
  experience: string
  clinicAddress: string
  availability?: TimeSlot[]
  image?: string
  rating?: number
  reviewCount?: number
  consultationFee?: number
  videoConsultationFee?: number
  about?: string
  timeSlots?: string[]
  consultationType?: string[]
}

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  age?: number // New field
  gender?: "Male" | "Female" | "Other" // New field
}

export interface TimeSlot {
  id: string
  doctorId: string
  date: string
  time: string
  isBooked: boolean
}

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed" | "approved"

export interface Appointment {
  id: string
  doctorId: string
  patientId: string
  date: string
  time: string
  status: AppointmentStatus
  doctorName: string
  patientName: string
  specialty: string
  followUp?: string
  paymentStatus?: "paid" | "pending" | "failed"
  consultationType?: "video" | "call" | "clinic"
  prescriptionId?: string // New field to link to prescription
  fee?: number
}

const BASE_URL = "https://doctor-api-u6mn.onrender.com"

// Check if JSON Server is running
const checkServerStatus = async () => {
  try {
    const response = await fetch(`${BASE_URL}/doctors`, { method: "HEAD" })
    return response.ok
  } catch (error) {
    return false
  }
}

// Auth API
export const authAPI = {
  async login(email: string, password: string, role: "doctor" | "patient") {
    try {
      const endpoint = role === "doctor" ? "doctors" : "patients"
      const response = await fetch(`${BASE_URL}/${endpoint}`)
      if (!response.ok) {
        throw new Error("Server not responding. Please make sure JSON Server is running on port 3001.")
      }
      const users = await response.json()
      const user = users.find((u: any) => u.email === email && u.password === password)
      if (!user) {
        throw new Error("Invalid email or password")
      }
      // Return user with role
      return { ...user, role }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async signup(userData: any, role: "doctor" | "patient") {
    try {
      const endpoint = role === "doctor" ? "doctors" : "patients"
      // Check if user already exists
      const existingResponse = await fetch(`${BASE_URL}/${endpoint}`)
      if (existingResponse.ok) {
        const existingUsers = await existingResponse.json()
        const userExists = existingUsers.find((u: any) => u.email === userData.email)
        if (userExists) {
          throw new Error("User with this email already exists")
        }
      }
      const response = await fetch(`${BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userData,
          id: Date.now().toString(),
          password: userData.password,
        }),
      })
      if (!response.ok) {
        throw new Error("Server not responding. Please make sure JSON Server is running on port 3001.")
      }
      const user = await response.json()
      return { ...user, role }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
}

// Doctors API
export const doctorsAPI = {
  async getAll(): Promise<Doctor[]> {
    try {
      const response = await fetch(`${BASE_URL}/doctors`)
      if (!response.ok) {
        throw new Error("Failed to fetch doctors")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async getById(id: string): Promise<Doctor> {
    try {
      const response = await fetch(`${BASE_URL}/doctors/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch doctor")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async update(id: string, data: Partial<Doctor>): Promise<Doctor> {
    try {
      const response = await fetch(`${BASE_URL}/doctors/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to update doctor")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
}

// Patients API
export const patientsAPI = {
  async getById(id: string): Promise<Patient> {
    try {
      const response = await fetch(`${BASE_URL}/patients/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch patient details")
      }
      return response.json()
    } catch (error) {
      console.error("Error fetching patient details:", error)
      throw error
    }
  },
  async getAll(): Promise<Patient[]> {
    try {
      const response = await fetch(`${BASE_URL}/patients`)
      if (!response.ok) {
        throw new Error("Failed to fetch patients")
      }
      return response.json()
    } catch (error) {
      console.error("Error fetching patients:", error)
      throw error
    }
  },
}

// Appointments API
export const appointmentsAPI = {
  async create(appointment: Omit<Appointment, "id">): Promise<Appointment> {
    try {
      const response = await fetch(`${BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...appointment, id: Date.now().toString() }),
      })
      if (!response.ok) {
        throw new Error("Failed to create appointment")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async getByDoctorId(doctorId: string): Promise<Appointment[]> {
    console.log(`Fetching appointments from: ${BASE_URL}/appointments?doctorId=${doctorId}`)
    try {
      const response = await fetch(`${BASE_URL}/appointments?doctorId=${doctorId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch appointments")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async getByPatientId(patientId: string): Promise<Appointment[]> {
    try {
      const response = await fetch(`${BASE_URL}/appointments?patientId=${patientId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch appointments")
      }
      return response.json()
    } catch (error) {
      console.error("Error fetching appointments:", error)
      throw error
    }
  },
  async getById(id: string): Promise<Appointment> {
    try {
      const response = await fetch(`${BASE_URL}/appointments/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch appointment")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async reschedule(id: string, newDate: string, newTime: string): Promise<Appointment> {
    console.log(`Attempting to PATCH ${BASE_URL}/appointments/${id} with new date/time and status 'pending'...`)
    console.log("New Date:", newDate, "New Time:", newTime)
    try {
      const response = await fetch(`${BASE_URL}/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: newDate, time: newTime, status: "pending" }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`)
      }
      const updatedAppointment: Appointment = await response.json()
      console.log("Appointment rescheduled successfully:", updatedAppointment)
      return updatedAppointment
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      throw error
    }
  },
  async updateStatus(id: string, status: Appointment["status"], prescriptionId?: string): Promise<Appointment> {
    try {
      const body: { status: Appointment["status"]; prescriptionId?: string } = { status }
      if (prescriptionId) {
        body.prescriptionId = prescriptionId
      }
      const response = await fetch(`${BASE_URL}/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        throw new Error("Failed to update appointment")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
}

// Prescriptions API
export const prescriptionsAPI = {
  async create(prescription: Omit<Prescription, "id">): Promise<Prescription> {
    try {
      const response = await fetch(`${BASE_URL}/prescriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...prescription, id: Date.now().toString() }),
      })
      if (!response.ok) {
        throw new Error("Failed to create prescription")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async getAll(): Promise<Prescription[]> {
    try {
      const response = await fetch(`${BASE_URL}/prescriptions`)
      if (!response.ok) {
        throw new Error("Failed to fetch prescriptions")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async getById(id: string): Promise<Prescription> {
    try {
      const response = await fetch(`${BASE_URL}/prescriptions/${id}`)
      if (!response.ok) {
        // If response is not ok, it means 404 or other error
        if (response.status === 404) {
          throw new Error(`Prescription with ID ${id} not found.`)
        }
        throw new Error(`Failed to fetch prescription: ${response.statusText}`)
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async update(id: string, data: Partial<Prescription>): Promise<Prescription> {
    try {
      const response = await fetch(`${BASE_URL}/prescriptions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to update prescription")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/prescriptions/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete prescription")
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
}
