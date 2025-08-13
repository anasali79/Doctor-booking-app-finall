"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/Navbar"
import { isValid } from "date-fns";
import {
  appointmentsAPI,
  patientsAPI,
  prescriptionsAPI,
  type Appointment,
  type Prescription,
  type Patient,
  doctorsAPI,
  type Doctor,
} from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { Calendar as CalendarIcon, ArrowLeft, FileText, Filter, Download, Pill, Stethoscope, UserCircle2, Phone, Video, Building2, Search as SearchIcon, UploadCloud, AlertTriangle } from "lucide-react"
import jsPDF from "jspdf"
// html2canvas was tried for exact snapshot export, but the user prefers the print-format PDF
import { format, isAfter, isBefore, parseISO } from "date-fns"
import Link from "next/link"
import { PrescriptionDetailView } from "@/components/PrescriptionDetailView"
import { useToast } from "@/hooks/use-toast"

export default function PatientMedicalHistoryPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const patientId = params?.id
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Filters
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [searchText, setSearchText] = useState<string>("") // doctor/diagnosis
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  useEffect(() => {
    const load = async () => {
      if (!patientId) return
      setIsLoading(true)
      try {
        const [p, apts, pres, docs] = await Promise.all([
          patientsAPI.getById(patientId),
          appointmentsAPI.getByPatientId(patientId),
          prescriptionsAPI.getByPatientId(patientId),
          doctorsAPI.getAll(),
        ])
        // Sort appointments newest first
        apts.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
        // Sort prescriptions newest first
        pres.sort((a, b) => parseISO(b.datePrescribed).getTime() - parseISO(a.datePrescribed).getTime())

        setPatient(p)
        setAppointments(apts)
        setPrescriptions(pres)
        setDoctors(docs)
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [patientId])

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const date = parseISO(apt.date)
      if (fromDate && isBefore(date, parseISO(fromDate))) return false
      if (toDate && isAfter(date, parseISO(toDate))) return false
      if (typeFilter !== "all" && apt.consultationType !== typeFilter) return false
      if (searchText) {
        const q = searchText.toLowerCase()
        const pre = prescriptions.find(p => p.appointmentId === apt.id)
        const diagnosis = pre?.diagnosis || pre?.symptoms || ""
        if (!apt.doctorName.toLowerCase().includes(q) && !diagnosis.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [appointments, fromDate, toDate, typeFilter, searchText, prescriptions])

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((pre) => {
      const date = parseISO(pre.datePrescribed)
      if (fromDate && isBefore(date, parseISO(fromDate))) return false
      if (toDate && isAfter(date, parseISO(toDate))) return false
      if (searchText) {
        const q = searchText.toLowerCase()
        if (!(pre.doctorName?.toLowerCase().includes(q) || pre.diagnosis?.toLowerCase().includes(q) || pre.symptoms?.toLowerCase().includes(q))) return false
      }
      return true
    })
  }, [prescriptions, fromDate, toDate, searchText])

  const totals = useMemo(() => ({
    appointments: filteredAppointments.length,
    prescriptions: filteredPrescriptions.length,
  }), [filteredAppointments.length, filteredPrescriptions.length])

  const appointmentIdToPrescription = useMemo(() => {
    const map: Record<string, Prescription> = {}
    prescriptions.forEach((pre) => {
      if (pre.appointmentId) map[pre.appointmentId] = pre
    })
    return map
  }, [prescriptions])

  const getStatusBadge = (status: Appointment["status"]) => {
    const classes = {
      completed: "bg-green-500/15 text-green-300 border-green-500/25",
      cancelled: "bg-red-500/15 text-red-300 border-red-500/25",
      confirmed: "bg-blue-500/15 text-blue-300 border-blue-500/25",
      pending: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
      approved: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    } as const
    return classes[status] || "bg-slate-500/15 text-slate-300 border-slate-500/25"
  }

  const exportCsv = () => {
    const header = [
      "Date",
      "Time",
      "Type",
      "Doctor",
      "Specialty",
      "Status",
      "Diagnosis",
      "Medicines",
    ]
    const rows = filteredAppointments.map((apt) => {
      const pre = appointmentIdToPrescription[apt.id]
      const diagnosis = pre?.diagnosis || pre?.symptoms || ""
      const meds = pre?.medicines?.map((m) => `${m.name} (${m.dosage})`).join("; ") || ""
      return [apt.date, apt.time, apt.consultationType ?? "", apt.doctorName, apt.specialty, apt.status, diagnosis, meds]
    })
    const csv = [header, ...rows].map((r) => r.map((c) => `"${(c ?? "").toString().replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `medical-history-${patientId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAttachmentUpload = async (pre: Prescription, files: FileList | null) => {
    if (!files || files.length === 0) return
    try {
      setIsUploading(true)
      const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const newAttachments: { id: string; name: string; type: "image" | "pdf"; url: string }[] = await Promise.all(
        Array.from(files).map(async (f, idx) => ({
          id: `${Date.now()}-${idx}`,
          name: f.name,
          type: f.type.startsWith("image/") ? "image" : "pdf",
          url: await toDataUrl(f),
        }))
      )
      const updated = await prescriptionsAPI.update(pre.id, { attachments: [...(pre.attachments ?? []), ...newAttachments] })
      setPrescriptions((prev) => prev.map((p) => (p.id === pre.id ? updated : p)))
      toast({ title: "Uploaded", description: `${newAttachments.length} file(s) attached to prescription.` })
    } catch (e) {
      toast({ title: "Upload failed", description: "Could not attach files.", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  const TypeIcon = ({ type }: { type?: Appointment["consultationType"] }) => {
    if (type === "video") return <Video className="w-4 h-4 text-green-400" />
    if (type === "call") return <Phone className="w-4 h-4 text-blue-400" />
    return <Building2 className="w-4 h-4 text-purple-400" />
  }

  const handleDownloadPdf = async () => {
    // Use the browser's print dialog to leverage print CSS (best "print format")
    // Users can choose "Save as PDF" to get the exact print preview style
    window.print()
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:px-0">
          <div className="flex items-center gap-3 mb-6 no-print">
            <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Medical History
            </h1>
          </div>

          {/* Patient Header */}
          <Card className="mb-6 border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                    <UserCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">{patient?.name ?? "Patient"}</CardTitle>
                    <CardDescription className="text-slate-400">{patient?.email} • {patient?.phone}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/doctor/patients`}>
                    <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent no-print">Patients</Button>
                  </Link>
                  <Link href={`/profile?id=${patientId}`}>
                    <Button className="bg-teal-600 hover:bg-teal-700 no-print">View Profile</Button>
                  </Link>
                  <div className="flex gap-2">
                    <Button onClick={handleDownloadPdf} variant="outline" className="border-slate-600 text-slate-300 bg-transparent no-print">
                      <Download className="w-4 h-4 mr-2" /> PDF
                    </Button>
                    <Button onClick={exportCsv} variant="outline" className="border-slate-600 text-slate-300 bg-transparent no-print">
                      CSV
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Filters, search, stats, view toggle */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 no-print">
            <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center"><Filter className="w-4 h-4 mr-2" /> Filters</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="from" className="text-slate-300">From</Label>
                  <Input id="from" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-slate-800/50 border-slate-600/50 text-white" />
                </div>
                <div>
                  <Label htmlFor="to" className="text-slate-300">To</Label>
                  <Input id="to" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-slate-800/50 border-slate-600/50 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white"><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 text-white">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-3">
                  <Label className="text-slate-300">Pick date range</Label>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {dateRange?.from && dateRange?.to
                            ? `${format(dateRange.from, "dd MMM yyyy")} - ${format(dateRange.to, "dd MMM yyyy")}`
                            : "Select range"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 bg-slate-900 border border-slate-700" align="start">
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={(range) => {
                            setDateRange(range)
                            if (range?.from) setFromDate(format(range.from, "yyyy-MM-dd"))
                            if (range?.to) setToDate(format(range.to, "yyyy-MM-dd"))
                          }}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      variant="outline"
                      className="border-slate-600 text-slate-300 bg-transparent"
                      onClick={() => { setFromDate(""); setToDate(""); setDateRange(undefined) }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <Label className="text-slate-300">Search by doctor or diagnosis</Label>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Dr. Sarah or Back Pain..."
                      className="pl-9 bg-slate-800/50 border-slate-600/50 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-slate-400 text-sm">Appointments</div>
                  <div className="text-2xl font-semibold text-white">{totals.appointments}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-slate-400 text-sm">Prescriptions</div>
                  <div className="text-2xl font-semibold text-white">{totals.prescriptions}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80">
              <CardHeader>
                <CardTitle className="text-white text-lg">About</CardTitle>
                <CardDescription className="text-slate-400">Patient medical history overview</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300 space-y-2">
                <div>View past appointments, diagnoses, and prescriptions grouped by date (newest first).</div>
                <div>Use filters to narrow down by date range and consultation type.</div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">View:</span>
                  <Button size="sm" variant={viewMode === "grid" ? "default" : "outline"} className={viewMode === "grid" ? "bg-teal-600 hover:bg-teal-700" : "border-slate-600 text-slate-300 bg-transparent"} onClick={() => setViewMode("grid")}>Grid</Button>
                  <Button size="sm" variant={viewMode === "timeline" ? "default" : "outline"} className={viewMode === "timeline" ? "bg-teal-600 hover:bg-teal-700" : "border-slate-600 text-slate-300 bg-transparent"} onClick={() => setViewMode("timeline")}>Timeline</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div id="history-card-export" className="space-y-8">
            {/* Appointments */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-teal-400" />
                <h2 className="text-xl font-semibold text-white">Appointments</h2>
              </div>
              <div className={viewMode === "timeline" ? "relative pl-6 space-y-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse bg-slate-800/50">
                      <CardHeader>
                        <div className="h-6 bg-slate-700 rounded w-3/4" />
                        <div className="h-4 bg-slate-700 rounded w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-20 bg-slate-700 rounded" />
                      </CardContent>
                    </Card>
                  ))
                ) : filteredAppointments.length === 0 ? (
                  <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80">
                    <CardContent className="p-6 text-slate-300">No appointments in selected range.</CardContent>
                  </Card>
                ) : (
                  filteredAppointments.map((apt, idx) => {
                    const pre = appointmentIdToPrescription[apt.id]
                    const diagnosis = pre?.diagnosis || pre?.symptoms
                    return (
                    <div key={apt.id} className={viewMode === "timeline" ? "relative" : ""}>
                      {viewMode === "timeline" && (
                        <>
                          <span className="absolute left-[-1.25rem] top-4 w-2 h-2 rounded-full bg-cyan-400" />
                          <span className="absolute left-[-1.02rem] top-4 -z-10 h-full w-0.5 bg-slate-700" />
                        </>
                      )}
                      <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                          <span>{format(parseISO(apt.date), "dd MMM yyyy")} • {apt.time}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusBadge(apt.status)} capitalize`}>{apt.status}</Badge>
                            <Badge className="bg-white/10 text-slate-100 border-white/20 capitalize flex items-center gap-1">
                              <TypeIcon type={apt.consultationType} /> {apt.consultationType}
                            </Badge>
                          </div>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {apt.doctorName} • {apt.specialty}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-slate-300 space-y-3">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-cyan-400" />
                          <span>Status: {apt.status}</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                          <div className="text-slate-400 text-sm mb-1">Diagnosis</div>
                          <div className="flex flex-wrap gap-2">
                            {(diagnosis ? diagnosis.split(",").map(d => d.trim()).filter(Boolean) : []).slice(0,6).map((tag, i) => (
                              <Badge key={i} className="bg-cyan-500/15 text-cyan-300 border-cyan-500/20">{tag}</Badge>
                            ))}
                            {!diagnosis && <span className="text-sm">Not recorded</span>}
                          </div>
                        </div>
                         <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                          <div className="text-slate-400 text-sm mb-1">Prescription</div>
                          {pre ? (
                            <div className="space-y-1 text-sm">
                              <div className="text-slate-300">
                                {pre.medicines?.length ? pre.medicines.map(m => `${m.name} (${m.dosage})`).join(", ") : "Medicines not added"}
                              </div>
                              {pre.followUpDate && (
                                <div className="text-slate-400">
                                  Follow-up: {(() => {
                                    try {
                                      const d = parseISO(pre.followUpDate)
                                      return isNaN(d.getTime()) ? "—" : format(d, "dd MMM yyyy")
                                    } catch {
                                      return "—"
                                    }
                                  })()}
                                </div>
                              )}
                               {/* Attachments preview and upload */}
                               {pre.attachments?.length ? (
                                 <div className="pt-2 space-y-2">
                                   <div className="text-slate-400">Attachments</div>
                                   <div className="flex flex-wrap gap-2">
                                     {pre.attachments.map(att => (
                                       <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded border border-white/20 text-slate-200 hover:bg-white/10">
                                         {att.type === "pdf" ? "PDF" : "Image"}: {att.name}
                                       </a>
                                     ))}
                                   </div>
                                 </div>
                               ) : null}
                               <label className="inline-flex items-center gap-2 mt-2 text-xs cursor-pointer text-slate-300">
                                 <UploadCloud className="w-4 h-4" />
                                 <span>{isUploading ? "Uploading..." : "Attach report"}</span>
                                 <input type="file" className="hidden" multiple accept="image/*,application/pdf" onChange={(e) => handleAttachmentUpload(pre, e.target.files)} />
                               </label>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2 border-slate-600/40 text-slate-200 hover:bg-white/10"
                                onClick={() => { setSelectedPrescription(pre); setShowPrescriptionDialog(true) }}
                              >
                                <FileText className="w-4 h-4 mr-2" /> View Prescription
                              </Button>
                            </div>
                          ) : (
                            <div className="text-sm text-slate-400">No prescription recorded</div>
                          )}
                        </div>
                      </CardContent>
                      </Card>
                    </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Prescriptions */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-semibold text-white">Prescriptions</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse bg-slate-800/50">
                      <CardHeader>
                        <div className="h-6 bg-slate-700 rounded w-3/4" />
                        <div className="h-4 bg-slate-700 rounded w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-20 bg-slate-700 rounded" />
                      </CardContent>
                    </Card>
                  ))
                ) : filteredPrescriptions.length === 0 ? (
                  <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80">
                    <CardContent className="p-6 text-slate-300">No prescriptions in selected range.</CardContent>
                  </Card>
                ) : (
                  filteredPrescriptions.map((pre) => (
                    <Card key={pre.id} className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                          <span>
                            {(() => { try { const d = parseISO(pre.datePrescribed); return isNaN(d.getTime()) ? "Date not available" : format(d, "dd MMM yyyy") } catch { return "Date not available" } })()}
                            {pre.timePrescribed ? ` • ${pre.timePrescribed}` : ""}
                          </span>
                          <Badge className="bg-white/10 text-slate-100 border-white/20 capitalize">{pre.doctorName}</Badge>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {pre.diagnosis || pre.symptoms || "—"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-slate-300 space-y-2">
                        <div className="text-sm">Medicines: {pre.medicines?.map((m) => `${m.name} (${m.dosage})`).join(", ") || "—"}</div>
                        {pre.followUpDate && (
                          <div className="text-sm">Follow-up: {(() => { try { const d = parseISO(pre.followUpDate); return isNaN(d.getTime()) ? "—" : format(d, "dd MMM yyyy") } catch { return "—" } })()}</div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Patient context: allergies and chronic conditions */}
          {patient && (patient.allergies?.length || patient.chronicConditions?.length) ? (
            <Card className="mt-8 border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-400" /> Patient Notes</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {patient.allergies?.length ? (
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Allergies</div>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((a, i) => (
                        <Badge key={i} className="bg-amber-500/15 text-amber-300 border-amber-500/20">{a}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {patient.chronicConditions?.length ? (
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Chronic Conditions</div>
                    <div className="flex flex-wrap gap-2">
                      {patient.chronicConditions.map((c, i) => (
                        <Badge key={i} className="bg-pink-500/15 text-pink-300 border-pink-500/20">{c}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {/* Follow-up reminder card */}
          {filteredPrescriptions.length > 0 && (() => {
            const upcoming = filteredPrescriptions
              .map(p => ({ p, d: (() => { try { const _d = parseISO(p.followUpDate || ""); return isNaN(_d.getTime()) ? null : _d } catch { return null } })() }))
              .filter(x => x.d && x.d.getTime() >= new Date().setHours(0,0,0,0))
              .sort((a,b) => (a.d!.getTime() - b.d!.getTime()))
            if (!upcoming.length) return null
            const next = upcoming[0]
            return (
              <Card className="mt-6 border border-teal-200/40 bg-white text-slate-800">
                <CardContent className="py-4">
                  <div className="text-sm text-slate-600">Next follow-up</div>
                  <div className="text-lg font-semibold">
                    {format(next.d!, "dd MMM yyyy")} with {next.p.doctorName}
                  </div>
                </CardContent>
              </Card>
            )
          })()}
          {/* Prescription Viewer */}
          {selectedPrescription && (
            <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
              <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[90vh] bg-slate-800 border-slate-700">
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="sr-only">Prescription Details</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[calc(90vh-64px)]">
                  <PrescriptionDetailView
                    prescription={selectedPrescription}
                    patient={patient as Patient}
                    doctor={doctors.find(d => d.id === selectedPrescription.doctorId) || undefined}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}


