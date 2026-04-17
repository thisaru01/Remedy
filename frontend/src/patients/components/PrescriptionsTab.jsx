import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock3,
  FileText,
  HeartPulse,
  Loader2,
  Pill,
  Stethoscope,
  UserRound,
  AlertCircle,
  Zap,
  Droplet,
  AlertTriangle,
  Clock,
} from "lucide-react";

import { getMyPatientPrescriptions } from "@/api/services/doctorPrescriptionService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

function PrescriptionDetails({ prescription }) {
  const medications = Array.isArray(prescription?.medications)
    ? prescription.medications
    : [];

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <CardHeader className="border-b bg-gradient-to-r from-sky-50 via-white to-indigo-50 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                Finalized
              </Badge>
              <Badge variant="outline" className="border-sky-200 text-sky-700">
                {medications.length} medication{medications.length === 1 ? "" : "s"}
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

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:text-right">
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
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            {/* Clinical Diagnosis Section */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                Clinical Diagnosis
              </div>
              <p className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 text-sm leading-relaxed text-slate-800">
                {prescription?.diagnosis || "No diagnosis available."}
              </p>
            </div>

            {prescription?.advice && (
              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Zap className="h-4 w-4 text-amber-600" />
                  Medical Advice & Instructions
                </div>
                <p className="whitespace-pre-wrap rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-sm leading-relaxed text-slate-800">
                  {prescription.advice}
                </p>
              </div>
            )}

            {prescription?.followUpDate && (
              <div className="rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-emerald-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-700">
                  <Calendar className="h-4 w-4" />
                  Recommended Follow-up
                </div>
                <div className="mt-2 text-sm font-semibold text-cyan-950">
                  {new Date(prescription.followUpDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            )}
          </div>

          {/* Medications Section */}
          <div className="space-y-4">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Pill className="h-4 w-4 text-purple-600" />
                Medications
              </div>
              <div className="space-y-4">
                {medications.length > 0 ? (
                  medications.map((medication, index) => (
                    <div
                      key={`${medication?.name || "med"}-${index}`}
                      className="border border-purple-100 rounded-lg bg-gradient-to-br from-purple-50/50 via-card to-blue-50/30 hover:shadow-md transition-all overflow-hidden"
                    >
                      <div className="p-5 space-y-4">
                        {/* Medication Name & Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="text-lg font-bold text-slate-900">{medication?.name || "Medication"}</div>
                            {medication?.route && (
                              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <Droplet className="w-3 h-3" />
                                Route: <span className="font-medium">{medication.route}</span>
                              </div>
                            )}
                          </div>
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 whitespace-nowrap">
                            #{index + 1}
                          </Badge>
                        </div>

                        {/* Medication Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Dosage */}
                          <div className="bg-white/60 rounded-lg p-3 border border-purple-100">
                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1">
                              <Zap className="w-3.5 h-3.5 text-purple-600" />
                              Dosage
                            </div>
                            <div className="text-sm font-bold text-slate-900 font-mono">{medication?.dosage || "-"}</div>
                          </div>

                          {/* Frequency */}
                          <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              Frequency
                            </div>
                            <div className="text-sm font-bold text-slate-900">{medication?.frequency || "-"}</div>
                          </div>

                          {/* Duration */}
                          <div className="bg-white/60 rounded-lg p-3 border border-emerald-100">
                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                              Duration
                            </div>
                            <div className="text-sm font-bold text-slate-900">{medication?.duration || "-"}</div>
                          </div>
                        </div>

                        {/* Notes Section */}
                        {medication?.notes && (
                          <>
                            <Separator className="my-1" />
                            <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3">
                              <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-2">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Special Instructions
                              </div>
                              <p className="text-sm text-amber-900 leading-relaxed">{medication.notes}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
                    No medications listed.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PrescriptionMenuItem({ prescription, isActive, onClick }) {
  return (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      className={[
        "h-auto w-full justify-start rounded-xl px-4 py-3 text-left",
        isActive
          ? "bg-slate-900 text-white hover:bg-slate-900"
          : "border border-transparent bg-white hover:border-slate-200 hover:bg-slate-50",
      ].join(" ")}
      onClick={onClick}
    >
      <div className="flex w-full flex-col items-start gap-1">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="truncate font-semibold">
            {prescription?.doctorName || prescription?.doctor?.name || "Doctor"}
          </span>
          <span className="text-[10px] uppercase tracking-wider opacity-70">
            {formatDate(prescription?.issuedAt || prescription?.createdAt)}
          </span>
        </div>
        <div className="line-clamp-2 text-xs leading-relaxed opacity-80">
          {prescription?.diagnosis || "No diagnosis available"}
        </div>
      </div>
    </Button>
  );
}

export default function PrescriptionsTab({ appointmentId } = {}) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
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
        const normalized = Array.isArray(list) ? list : [];
        if (mounted) {
          setPrescriptions(normalized);
          const matched = appointmentId
            ? normalized.find(
                (item) => String(item?.appointmentId) === String(appointmentId),
              )
            : normalized[0];
          setSelectedId(matched?._id || normalized[0]?._id || null);
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

  const selectedPrescription = useMemo(
    () =>
      prescriptions.find((item) => String(item?._id) === String(selectedId)) ||
      (appointmentId
        ? prescriptions.find(
            (item) => String(item?.appointmentId) === String(appointmentId),
          )
        : prescriptions[0]) ||
      null,
    [prescriptions, selectedId, appointmentId],
  );

  const appointmentPrescription = useMemo(
    () =>
      appointmentId
        ? prescriptions.find(
            (item) => String(item?.appointmentId) === String(appointmentId),
          ) || null
        : null,
    [prescriptions, appointmentId],
  );

  const appointmentViewMode = Boolean(appointmentId);

  return (
    <div className="space-y-5">
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

      {!loading && !error && prescriptions.length === 0 && (
        <Card className="border-dashed border-slate-200 bg-white">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
              <FileText className="h-7 w-7 text-sky-700" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">No prescriptions yet</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Once your doctor finalizes a prescription, it will appear here automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && prescriptions.length > 0 && appointmentViewMode && (
        <div className="space-y-4">
          {appointmentPrescription ? (
            <PrescriptionDetails prescription={appointmentPrescription} />
          ) : (
            <Card className="border-dashed border-slate-200 bg-white">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
                <FileText className="h-10 w-10 text-slate-400" />
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    No prescription for this appointment yet
                  </h3>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Once your doctor finalizes a prescription for this appointment, it will appear here automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!loading && !error && prescriptions.length > 0 && !appointmentViewMode && (
        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
            <CardHeader className="border-b bg-slate-50 pb-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                Prescription Menu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-3">
              {prescriptions.map((prescription) => {
                const isActive = String(selectedPrescription?._id) === String(prescription?._id);
                return (
                  <PrescriptionMenuItem
                    key={prescription?._id || `${prescription?.appointmentId}-${prescription?.createdAt}`}
                    prescription={prescription}
                    isActive={isActive}
                    onClick={() => setSelectedId(prescription?._id)}
                  />
                );
              })}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {selectedPrescription ? (
              <>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-muted-foreground shadow-sm">
                  <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                    <UserRound className="h-4 w-4 text-sky-600" />
                    Doctor:
                  </span>
                  <span className="ml-1 text-slate-700">
                    {selectedPrescription.doctorName || selectedPrescription.doctor?.name || "Doctor"}
                  </span>
                </div>
                <PrescriptionDetails prescription={selectedPrescription} />
              </>
            ) : (
              <Card className="border-dashed border-slate-200 bg-white">
                <CardContent className="py-16 text-center text-muted-foreground">
                  Select a prescription from the sidebar to view the details.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
