"use client"

import type * as React from "react"
import type { Prescription, Patient, Doctor } from "@/lib/api"
import { Calendar, Globe, Mail, MapPin, Phone, Pill, Stethoscope } from "lucide-react"
import { QRCode } from "./qr-code"

function formatDate(value?: string | Date) {
  if (!value) return "—"
  const d = typeof value === "string" ? new Date(value) : value
  if (isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
}

function formatDateTime(value?: string | Date) {
  if (!value) return "—"
  const d = typeof value === "string" ? new Date(value) : value
  if (isNaN(d.getTime())) return String(value)
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

type Props = {
  prescription: Prescription
  patient?: Patient
  doctor?: Doctor
}

export function PrescriptionDetailView({ prescription, patient, doctor }: Props) {
  // Best practice: Link to main prescription view page with all options
  const prescriptionUrl = `https://doctor-booking-app-orpin.vercel.app/prescription/${prescription.id}`

  return (
    <div className="min-h-screen bg-[#0c3a53] p-4 print:bg-white print:p-0">
      {/* Page */}
      <div className="mx-auto w-full max-w-[900px] overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-black/5 print:rounded-none print:shadow-none">
        {/* Header Section 1: Light blue curved banner with "PRESCRIPTION" only */}
        <div className="relative h-20 overflow-hidden">
          {/* Main curved banner */}
          <div className="absolute right-0 top-0 h-16 w-[65%] rounded-bl-[48px] bg-sky-500" />
          {/* Light overlay */}
          <div className="absolute right-[25%] top-0 h-12 w-48 rounded-bl-[48px] bg-sky-100" />

          {/* PRESCRIPTION text */}
          <div className="relative z-10 flex h-full items-center justify-end pr-12">
            <div className="rounded-full bg-sky-700 px-4 py-1 text-[11px] font-bold tracking-[0.2em] text-white">
              PRESCRIPTION
            </div>
          </div>
        </div>

        {/* Header Section 2: Doctor info with icon */}
        <div className="px-10 py-6">
          <div className="flex items-start gap-4">
            {/* Left: Stethoscope icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <Stethoscope className="h-9 w-9" />
            </div>

            {/* Right: Doctor details */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-sky-900">{doctor?.name || "Dr. Jane Smith"}</h1>
              <p className="text-sm text-sky-600">{doctor?.specialty || "Urologist"}</p>
              <p className="text-xs text-slate-500 mt-1">{doctor?.clinicAddress || "your tagline here"}</p>
            </div>
          </div>
        </div>

        {/* Separator line */}
        <div className="mx-10 border-b border-sky-200/50"></div>

        {/* Patient Information Section */}
        <section className="px-10 pb-6">
          <div className="grid grid-cols-1 gap-x-12 gap-y-3 sm:grid-cols-2">
            <FieldLine label="Patient Name" value={prescription.patientName || patient?.name} />
            <FieldLine label="Insurance" value={patient?.policyNumber}/>
            <FieldLine label="Address" value="—" />
            <FieldLine label="Diagnosis" value={prescription.diagnosis} />
            <FieldLine label="Date" value={formatDateTime(prescription.datePrescribed)} />
            <FieldLine label="Appointment ID" value={prescription.appointmentId} />
          </div>
        </section>

        {/* Main Content Area */}
        <section className="relative px-10 pb-8 pt-6">
          {/* Watermark */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-10 mx-auto hidden h-72 w-72 opacity-[0.06] sm:block"
          >
            <div className="flex h-full w-full items-center justify-center rounded-full">
              <Stethoscope className="h-56 w-56 text-sky-700" />
            </div>
          </div>

          {/* Rx */}
          <div className="mb-6 text-sky-800">
            <div className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              {"R"}
              <span className="-ml-2 align-top text-3xl sm:text-4xl">x</span>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 space-y-6">
            {/* Medicines */}
            <ListSection title="Medicines" icon={<Pill className="h-4 w-4 text-sky-600" />}>
              {prescription.medicines?.length ? (
                <ul className="ml-4 list-disc space-y-2 text-[13px] text-slate-700">
                  {prescription.medicines.map((m, i) => (
                    <li key={i}>
                      <span className="font-medium text-slate-900">{m.name}</span> – {m.dosage}, {m.frequency} for{" "}
                      {m.duration}
                      {m.notes ? ` (${m.notes})` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyLine />
              )}
            </ListSection>

            {/* Symptoms */}
            {prescription.symptoms ? (
              <ListSection title="Symptoms">
                <ul className="ml-4 list-disc space-y-1 text-[13px] text-slate-700">
                  {prescription.symptoms
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                </ul>
              </ListSection>
            ) : null}

            {/* Tests */}
            {prescription.testsRecommended ? (
              <ListSection title="Tests Recommended">
                <ul className="ml-4 list-disc space-y-1 text-[13px] text-slate-700">
                  {prescription.testsRecommended
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                </ul>
              </ListSection>
            ) : null}

            {/* Vitals */}
            {prescription.vitals &&
            (prescription.vitals.temperature || prescription.vitals.bp || prescription.vitals.pulse) ? (
              <ListSection title="Vitals">
                <ul className="ml-4 list-disc space-y-1 text-[13px] text-slate-700">
                  {prescription.vitals.temperature ? <li>Temperature: {prescription.vitals.temperature}</li> : null}
                  {prescription.vitals.bp ? <li>BP: {prescription.vitals.bp}</li> : null}
                  {prescription.vitals.pulse ? <li>Pulse: {prescription.vitals.pulse}</li> : null}
                </ul>
              </ListSection>
            ) : null}

            {/* General Notes */}
            {prescription.generalNotes ? (
              <ListSection title="Instructions">
                <ul className="ml-4 list-disc space-y-1 text-[13px] text-slate-700">
                  {prescription.generalNotes
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                </ul>
              </ListSection>
            ) : null}

            {/* Follow-up and Appointment ID */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[13px] text-slate-700">
              {prescription.followUpDate ? (
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-sky-600" />
                  <span className="font-medium">Follow-up:</span> {formatDate(prescription.followUpDate)}
                </span>
              ) : null}
            </div>
          </div>

          {/* Signature */}
          <div className="mt-12 flex items-end justify-end">
            <div className="w-64">
              <div className="h-10 border-b border-slate-300"></div>
              <p className="mt-1 text-right text-[12px] text-sky-600">Signature</p>
              {prescription.doctorSignatureText ? (
                <p className="mt-0.5 text-right text-[12px] font-medium text-slate-800">
                  {prescription.doctorSignatureText}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {/* Footer: Blue band with QR and contact info */}
        <footer className="relative mt-4 h-[120px] w-full">
          {/* Blue background */}
          <div className="absolute inset-x-0 bottom-0 h-[110px] bg-sky-500" />
          {/* Light curved corner with decorative text */}
          <div className="absolute bottom-0 right-0 h-[110px] w-40 rounded-tl-[90px] bg-sky-100 flex items-end justify-end p-4">
            <div className="text-slate-700 text-xs font-medium transform rotate-12">
              <div className="flex flex-col items-end">
            
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 grid h-full grid-cols-12 items-center px-10 text-white">
            {/* QR Code */}
            <div className="col-span-12 flex items-center gap-4 sm:col-span-4 lg:col-span-3">
              <div className="rounded-md bg-white/95 p-2">
                <QRCode text={prescriptionUrl} size={84} />
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-span-12 mt-4 sm:col-span-8 sm:mt-0 lg:col-span-9">
              <div className="grid grid-cols-1 gap-y-3 text-[13px] sm:grid-cols-2 text-black">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-black" />
                  <span>{doctor?.phone || "(+00) 123 456 789"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-black" />
                  <span>{"doctor-booking-app-orpin.vercel.app"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-black" />
                  <span>{doctor?.email || "company@mail.com"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-black" />
                  <span className="truncate">{doctor?.clinicAddress || "your company address"}</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  )
}

function FieldLine({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="w-32 shrink-0 text-slate-600">{label}</span>
      <div className="relative -mb-1 flex-1">
        <div className="min-h-[22px] border-b border-sky-200/80 pb-1 text-slate-900">
          {value ? <span>{value}</span> : <span className="opacity-40">{"______________"}</span>}
        </div>
      </div>
    </div>
  )
}

function ListSection({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center gap-2">
        {icon}
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function EmptyLine() {
  return <div className="h-6 border-b border-dotted border-slate-300/80" />
}
