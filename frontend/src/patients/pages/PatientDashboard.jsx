import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Calendar, FileText, Pill, Loader2, RefreshCw } from "lucide-react";

import { getAppointments } from "@/api/services/appointmentService";
import { getMyPatientPrescriptions } from "@/api/services/doctorPrescriptionService";
import { getMyPatientReports } from "@/api/services/patientReportService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppointmentCard from "@/patients/components/AppointmentCard.jsx";

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        getAppointments(),
        getMyPatientPrescriptions({ status: "finalized" }),
        getMyPatientReports(),
      ]);

      const [apptsResSettled, prescResSettled, reportsResSettled] = results;

      if (apptsResSettled.status === "fulfilled") {
        const apptsRes = apptsResSettled.value;
        const appts = apptsRes?.data?.appointments ?? apptsRes?.data ?? [];
        setAppointments(Array.isArray(appts) ? appts : []);
      } else {
        console.error("getAppointments failed", apptsResSettled.reason);
        toast.error(
          apptsResSettled.reason?.message || "Failed to load appointments",
        );
        setAppointments([]);
      }

      if (prescResSettled.status === "fulfilled") {
        const prescRes = prescResSettled.value;
        const presc =
          prescRes?.data?.prescriptions ??
          prescRes?.data?.data ??
          prescRes?.data ??
          [];
        setPrescriptions(Array.isArray(presc) ? presc : []);
      } else {
        console.error(
          "getMyPatientPrescriptions failed",
          prescResSettled.reason,
        );
        toast.error(
          prescResSettled.reason?.message || "Failed to load prescriptions",
        );
        setPrescriptions([]);
      }

      if (reportsResSettled.status === "fulfilled") {
        const reportsRes = reportsResSettled.value;
        const r =
          reportsRes?.data?.reports ??
          reportsRes?.data?.data ??
          reportsRes?.data ??
          [];
        setReports(Array.isArray(r) ? r : []);
      } else {
        console.error("getMyPatientReports failed", reportsResSettled.reason);
        toast.error(
          reportsResSettled.reason?.message || "Failed to load reports",
        );
        setReports([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
        <p className="text-muted-foreground italic text-sm">
          Overview of your appointments, prescriptions and reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-1">
        <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/2 to-transparent shadow-sm">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{upcoming.length}</div>
                <div className="text-sm text-muted-foreground">
                  Upcoming appointments
                </div>
              </div>
              <Calendar className="w-8 h-8 opacity-60" />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/patient/appointments")}
              >
                Manage
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/book-appointments")}
              >
                Book
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
                <div className="text-sm text-muted-foreground">
                  Recent finalized
                </div>
              </div>
              <Pill className="w-8 h-8 opacity-60" />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/patient/prescriptions")}
              >
                View
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/2 to-transparent shadow-sm">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{reports.length}</div>
                <div className="text-sm text-muted-foreground">
                  Uploaded & shared
                </div>
              </div>
              <FileText className="w-8 h-8 opacity-60" />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/patient/reports")}
              >
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/patient/reports/upload")}
              >
                Upload
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
                <Link to="/patient/appointments">View all</Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                <p className="text-lg font-medium">No upcoming appointments</p>
                <p className="text-xs italic opacity-60">
                  Book a new appointment to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {upcoming.slice(0, 3).map((appt) => (
                  <AppointmentCard key={appt._id} appt={appt} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/2 to-transparent shadow-sm">
          <CardHeader className="border-b border-white/5 p-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Recent Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPrescriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                <p className="text-lg font-medium">No prescriptions yet</p>
                <p className="text-xs italic opacity-60">
                  Prescriptions will appear after your appointments.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPrescriptions.map((presc) => (
                  <div
                    key={presc._id || presc.appointmentId}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <div className="font-medium">
                        {presc?.doctorName || presc?.doctor?.name || "Doctor"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(
                          presc?.issuedAt || presc?.createdAt || Date.now(),
                        ).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/patient/prescriptions`)}
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
      </div>
    </div>
  );
}
