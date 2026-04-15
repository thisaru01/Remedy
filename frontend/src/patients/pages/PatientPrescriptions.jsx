import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  HeartPulse,
  Loader2,
  Pill,
  Stethoscope,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import { getMyPatientPrescriptions } from "@/api/services/doctorPrescriptionService";

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString();
  } catch (error) {
    return String(value);
  }
};

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return String(value);
  }
};

function PrescriptionCard({ prescription }) {
  const medicationCount = Array.isArray(prescription?.medications)
    ? prescription.medications.length
    : 0;

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="border-b bg-gradient-to-r from-sky-50 via-white to-indigo-50 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                Finalized
              </Badge>
              <Badge variant="outline" className="border-sky-200 text-sky-700">
                {medicationCount} medication{medicationCount === 1 ? "" : "s"}
              </Badge>
            </div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              {prescription?.doctorName || prescription?.doctor?.name || "Doctor"}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                Issued {formatDateTime(prescription?.issuedAt || prescription?.createdAt)}
              </span>
              {prescription?.followUpDate && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Follow-up {formatDate(prescription.followUpDate)}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Appointment ID
            </div>
            <div className="mt-1 font-mono text-xs text-slate-700">
              {String(prescription?.appointmentId || "-")}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Stethoscope className="h-4 w-4 text-sky-600" />
                Diagnosis
              </div>
              <p className="rounded-xl border border-sky-100 bg-sky-50/70 p-4 text-sm leading-relaxed text-slate-800">
                {prescription?.diagnosis || "No diagnosis available."}
              </p>
            </div>

            {prescription?.advice && (
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <HeartPulse className="h-4 w-4 text-amber-600" />
                  Medical Advice
                </div>
                <p className="rounded-xl border border-amber-100 bg-amber-50/70 p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {prescription.advice}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Pill className="h-4 w-4 text-purple-600" />
                Medications
              </div>
              <div className="space-y-3">
                {Array.isArray(prescription?.medications) && prescription.medications.length > 0 ? (
                  prescription.medications.map((medication, index) => (
                    <div
                      key={`${medication?.name || "med"}-${index}`}
                      className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-4"
                    >
                      <div className="font-semibold text-slate-900">
                        {medication?.name || "Medication"}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-700">
                        <span className="rounded-full bg-purple-100 px-2.5 py-1 font-medium text-purple-700">
                          {medication?.dosage || "-"}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {medication?.frequency || "-"}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {medication?.duration || "-"}
                        </span>
                      </div>
                      {(medication?.route || medication?.notes) && (
                        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                          {medication?.route && <div>Route: {medication.route}</div>}
                          {medication?.notes && <div>Notes: {medication.notes}</div>}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
                    No medications listed.
                  </div>
                )}
              </div>
            </div>

            {prescription?.followUpDate && (
              <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-700">
                  <Calendar className="h-4 w-4" />
                  Recommended Follow-up
                </div>
                <div className="mt-2 text-sm font-semibold text-cyan-950">
                  {formatDate(prescription.followUpDate)}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadPrescriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getMyPatientPrescriptions({ status: "finalized" });
        const list = response?.data?.prescriptions || response?.data?.data || [];
        if (mounted) {
          setPrescriptions(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || "Failed to load prescriptions");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPrescriptions();

    return () => {
      mounted = false;
    };
  }, []);

  const hasPrescriptions = useMemo(() => prescriptions.length > 0, [prescriptions]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-slate-50 via-white to-sky-50 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              <FileText className="h-3.5 w-3.5" />
              My Prescriptions
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              View Your Prescription History
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Review finalized prescriptions issued by your doctor, including medications, medical advice, and follow-up dates.
            </p>
          </div>

          <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm sm:block">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Prescriptions
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {loading ? "..." : prescriptions.length}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading your prescriptions...
        </div>
      )}

      {!loading && error && (
        <Alert variant="destructive" className="border-2">
          <FileText className="h-4 w-4" />
          <AlertTitle>Error loading prescriptions</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && !hasPrescriptions && (
        <Card className="border-dashed border-slate-200 bg-white">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
              <FileText className="h-7 w-7 text-sky-700" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">No prescriptions yet</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Once your doctor finalizes a prescription, it will appear here automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && hasPrescriptions && (
        <div className="space-y-5">
          {prescriptions.map((prescription) => (
            <PrescriptionCard
              key={prescription?._id || `${prescription?.appointmentId}-${prescription?.createdAt}`}
              prescription={prescription}
            />
          ))}
        </div>
      )}
    </div>
  );
}
