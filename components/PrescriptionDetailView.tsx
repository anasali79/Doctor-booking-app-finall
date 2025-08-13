"use client"

import { type Prescription, type Patient, type Doctor } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, User, Stethoscope, Hospital, Phone, FlaskConical, ClipboardList, Pill, BookText } from 'lucide-react'
import { formatDateTimeIfNeeded } from "@/components/PrescriptionForm"

interface PrescriptionDetailViewProps {
  prescription: Prescription
  patient: Patient | undefined
  doctor: Doctor | undefined
}

export function PrescriptionDetailView({ prescription, patient, doctor }: PrescriptionDetailViewProps) {
  return (
    <Card className="bg-slate-800 border-slate-700 text-white shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-slate-700/50 p-6 border-b border-slate-600">
        <CardTitle className="text-3xl font-bold text-teal-300 flex items-center">
          <ClipboardList className="w-8 h-8 mr-3 text-teal-400" />
          Prescription Details
        </CardTitle>
        <p className="text-slate-400 text-sm mt-2">
          Issued on: {formatDateTimeIfNeeded(prescription.datePrescribed)}  | Appointment ID: {prescription.appointmentId}
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Doctor Details */}
        {doctor && (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-blue-400" />
              Doctor Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-slate-300 text-sm">
              <p>
                <span className="font-medium text-white">Name:</span> {doctor.name}, {doctor.qualifications}
              </p>
              <p>
                <span className="font-medium text-white">Specialty:</span> {doctor.specialty}
              </p>
              <p className="flex items-center">
                <Hospital className="w-4 h-4 mr-2 text-purple-400" />
                <span className="font-medium text-white">Clinic:</span> {doctor.clinicAddress}
              </p>
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-green-400" />
                <span className="font-medium text-white">Contact:</span> {doctor.phone}
              </p>
            </div>
          </div>
        )}

        <Separator className="bg-slate-600" />

        {/* Patient Details */}
        {patient && (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-400" />
              Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 text-slate-300 text-sm">
              <p>
                <span className="font-medium text-white">Name:</span> {patient.name}
              </p>
              <p>
                <span className="font-medium text-white">Age:</span> {patient.age || "N/A"}
              </p>
              <p>
                <span className="font-medium text-white">Gender:</span> {patient.gender || "N/A"}
              </p>
            </div>
          </div>
        )}

        <Separator className="bg-slate-600" />

        {/* Symptoms & Diagnosis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prescription.symptoms && (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">Symptoms:</h3>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                {prescription.symptoms.split(',').map((s, idx) => (
                  <li key={idx}>{s.trim()}</li>
                ))}
              </ul>
            </div>
          )}
          {prescription.diagnosis && (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">Diagnosis:</h3>
              <p className="text-slate-300 text-sm">{prescription.diagnosis}</p>
            </div>
          )}
        </div>

        {/* Vitals */}
        {prescription.vitals && (prescription.vitals.temperature || prescription.vitals.bp || prescription.vitals.pulse) && (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Vitals:</h3>
            <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
              {prescription.vitals.temperature && <li>Temperature: {prescription.vitals.temperature}</li>}
              {prescription.vitals.bp && <li>BP: {prescription.vitals.bp}</li>}
              {prescription.vitals.pulse && <li>Pulse: {prescription.vitals.pulse}</li>}
            </ul>
          </div>
        )}

        <Separator className="bg-slate-600" />

        {/* Medicines Section */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Pill className="w-5 h-5 mr-2 text-green-400" />
            Medicines:
          </h3>
          <ul className="list-decimal list-inside text-slate-300 text-sm space-y-2">
            {prescription.medicines.length > 0 ? (
              prescription.medicines.map((med, idx) => (
                <li key={idx}>
                  <span className="font-medium text-white">{med.name}</span> – {med.dosage},{" "}
                  {med.frequency} for {med.duration}
                  {med.notes && ` (${med.notes})`}
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic">No medicines prescribed.</li>
            )}
          </ul>
        </div>

        {/* Tests Recommended Section */}
        {prescription.testsRecommended && (
          <>
            <Separator className="bg-slate-600" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <FlaskConical className="w-5 h-5 mr-2 text-orange-400" />
                Tests Recommended:
              </h3>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                {/* Split by newline for tests recommended */}
                {prescription.testsRecommended.split('\n').filter(Boolean).map((t, idx) => (
                  <li key={idx}>{t.trim()}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Instructions Section */}
        {prescription.generalNotes && (
          <>
            <Separator className="bg-slate-600" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <BookText className="w-5 h-5 mr-2 text-purple-400" />
                Instructions:
              </h3>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                {/* Split by newline for general notes/instructions */}
                {prescription.generalNotes.split('\n').filter(Boolean).map((note, idx) => (
                  <li key={idx}>{note.trim()}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Follow-up Date */}
        {prescription.followUpDate && (
          <>
            <Separator className="bg-slate-600" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                Follow-up Date:
              </h3>
              <p className="text-slate-300 text-sm">{prescription.followUpDate}</p>
            </div>
          </>
        )}

        {/* Doctor Signature */}
        {prescription.doctorSignatureText && (
          <div className="mt-8 text-right">
           <h1 className="text-slate-300 text-sm font-medium">Doctor Signature</h1>
            <p className="text-slate-300 text-sm font-medium">{prescription.doctorSignatureText}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
