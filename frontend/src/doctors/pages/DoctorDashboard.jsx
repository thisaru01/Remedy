import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Calendar,
  FileText,
  Pill,
  RefreshCw,
  Loader2,
  Users,
} from "lucide-react";

import { getAppointments } from "@/api/services/appointmentService";
import { getMyDoctorPrescriptions } from "@/api/services/doctorPrescriptionService";
import { getSharedWithMePatientReports } from "@/api/services/patientReportService";
import { getOwnSchedules } from "@/api/services/scheduleService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth/useAuth";

function formatDateTime(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

export default function DoctorDashboard() {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        // backend will scope appointments to the authenticated doctor
        getAppointments(),
        getMyDoctorPrescriptions({ status: "finalized" }),
        getSharedWithMePatientReports(),
        getOwnSchedules(),
      ]);

      const [apptsRes, prescRes, reportsRes, schedulesRes] = results;

      if (apptsRes.status === "fulfilled") {
        const payload = apptsRes.value;
        const list = payload?.data?.appointments ?? payload?.data ?? [];
        setAppointments(Array.isArray(list) ? list : []);
      } else {
        console.error("getAppointments failed", apptsRes.reason);
        toast.error(apptsRes.reason?.message || "Failed to load appointments");
        setAppointments([]);
      }

      if (prescRes.status === "fulfilled") {
        const payload = prescRes.value;
        const list =
          payload?.data?.prescriptions ??
          payload?.data?.data ??
          payload?.data ??
          [];
        setPrescriptions(Array.isArray(list) ? list : []);
      } else {
        console.error("getMyDoctorPrescriptions failed", prescRes.reason);
        toast.error(prescRes.reason?.message || "Failed to load prescriptions");
        setPrescriptions([]);
      }

      if (reportsRes.status === "fulfilled") {
        const payload = reportsRes.value;
        const list =
          payload?.data?.reports ?? payload?.data?.data ?? payload?.data ?? [];
        setReports(Array.isArray(list) ? list : []);
      } else {
        console.error(
          "getSharedWithMePatientReports failed",
          reportsRes.reason,
        );
        toast.error(
          reportsRes.reason?.message || "Failed to load shared reports",
        );
        setReports([]);
      }

      if (schedulesRes.status === "fulfilled") {
        const payload = schedulesRes.value;
        const list = payload?.data?.schedules ?? payload?.data ?? [];
        setSchedules(Array.isArray(list) ? list : []);
      } else {
        console.error("getOwnSchedules failed", schedulesRes.reason);
        toast.error(schedulesRes.reason?.message || "Failed to load schedules");
        setSchedules([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const upcoming = useMemo(() => {
    return appointments.filter((a) => {
      const s = String(a?.status ?? "").toLowerCase();
      return s !== "completed" && s !== "cancelled" && s !== "rejected";
    });
  }, [appointments]);

  const recentPrescriptions = useMemo(
    () => prescriptions.slice(0, 3),
    [prescriptions],
  );
  const recentReports = useMemo(() => reports.slice(0, 3), [reports]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
        <p className="text-muted-foreground italic text-sm">
          Overview of your schedule, appointments and patient activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-1">
        <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/2 to-transparent shadow-sm">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{appointments.length}</div>
                <div className="text-sm text-muted-foreground">
                  Total assigned
                </div>
              </div>
              <Users className="w-8 h-8 opacity-60" />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/doctor/appointments/pending")}
              >
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/2 to-transparent shadow-sm">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{schedules.length}</div>
                <div className="text-sm text-muted-foreground">
                  Defined slots
                </div>
              </div>
              <Calendar className="w-8 h-8 opacity-60" />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/doctor/schedule/manage")}
              >
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/2 to-transparent shadow-sm">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{prescriptions.length}</div>
                <div className="text-sm text-muted-foreground">Finalized</div>
              </div>
              <Pill className="w-8 h-8 opacity-60" />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/doctor/patient-reports")}
              >
                View reports
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/2 to-transparent shadow-sm">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Shared Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{reports.length}</div>
                <div className="text-sm text-muted-foreground">
                  Shared with you
                </div>
              </div>
              <FileText className="w-8 h-8 opacity-60" />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/doctor/patient-reports")}
              >
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-1">
        <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/2 to-transparent shadow-sm">
          <CardHeader className="border-b border-white/5 flex items-center justify-between p-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Upcoming Appointments
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={fetchData}>
                <RefreshCw className="w-4 h-4" /> Refresh
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/doctor/appointments/pending">View all</Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                <p className="text-lg font-medium">No upcoming appointments</p>
                <p className="text-xs italic opacity-60">
                  You will see scheduled appointments here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 4).map((appt) => (
                  <div
                    key={appt._id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <div className="font-medium">
                        {appt?.patientName ||
                          appt?.patient?.name ||
                          String(appt?.patientId || "-")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(appt?.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/doctor/appointments/detail/${appt._id}`)
                        }
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/2 to-transparent shadow-sm">
          <CardHeader className="border-b border-white/5 p-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground">
                  Recent Prescriptions
                </div>
                {recentPrescriptions.length === 0 ? (
                  <div className="pt-4 text-sm text-muted-foreground">
                    No recent prescriptions.
                  </div>
                ) : (
                  recentPrescriptions.map((p) => (
                    <div
                      key={p._id || p.appointmentId}
                      className="flex items-center justify-between rounded-md border p-3 mt-2"
                    >
                      <div>
                        <div className="font-medium">
                          {p?.patientName || p?.patient?.name || "Patient"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(p?.issuedAt || p?.createdAt)}
                        </div>
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/doctor/appointments/detail/${p?.appointmentId}`,
                            )
                          }
                        >
                          Open
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4">
                <div className="text-xs text-muted-foreground">
                  Recent Shared Reports
                </div>
                {recentReports.length === 0 ? (
                  <div className="pt-4 text-sm text-muted-foreground">
                    No recent reports.
                  </div>
                ) : (
                  recentReports.map((r) => (
                    <div
                      key={r._id || r.id}
                      className="flex items-center justify-between rounded-md border p-3 mt-2"
                    >
                      <div>
                        <div className="font-medium">
                          {r?.title || r?.name || "Report"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(r?.createdAt)}
                        </div>
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/doctor/patient-reports`)}
                        >
                          Open
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
