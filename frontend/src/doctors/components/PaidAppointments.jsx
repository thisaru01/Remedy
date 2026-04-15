import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAppointments } from "@/api/services/appointmentService";
import { getSchedule } from "@/api/services/scheduleService";
import { getSessionByAppointmentId } from "@/api/services/telemedicineService";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

function formatDate(dt) {
  try {
    return new Date(dt).toLocaleString();
  } catch (e) {
    return dt;
  }
}

function getNextScheduledDate(createdAt, dayName) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const targetDay = days.indexOf(dayName);
  if (targetDay === -1) return null;
  const start = new Date(createdAt);
  if (isNaN(start.getTime())) return null;
  const diff = (targetDay - start.getDay() + 7) % 7;
  const result = new Date(start);
  result.setDate(start.getDate() + diff);
  return result.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function AppointmentCard({ appt }) {
  const [schedule, setSchedule] = useState(null);
  const [scheduledDate, setScheduledDate] = useState(null);

  useEffect(() => {
    if (!appt?.scheduleId || !appt?.createdAt) return;
    let mounted = true;

    getSchedule(appt.scheduleId)
      .then((res) => {
        const s = res?.data?.schedule ?? res?.data ?? null;
        if (!s || !mounted) return;
        setSchedule(s);
        setScheduledDate(getNextScheduledDate(appt.createdAt, s.day));
      })
      .catch(() => {
        // silently ignore — scheduled date is informational only
      });

    return () => { mounted = false; };
  }, [appt?.scheduleId, appt?.createdAt]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            {schedule && (
              <div className="text-sm font-semibold text-primary">
                {schedule.day} · {schedule.startTime}{schedule.endTime ? ` - ${schedule.endTime}` : ""}
              </div>
            )}
            {scheduledDate && (
              <div className="text-xs text-muted-foreground mt-0.5">
                <span className="font-medium">Scheduled&nbsp;</span>{scheduledDate}
              </div>
            )}
          </div>
          {appt?.appointmentNumber && (
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-primary text-primary-foreground font-semibold">
              {appt.appointmentNumber}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <div className="text-xs text-muted-foreground">Patient ID</div>
            <div className="text-sm">{String(appt.patientId)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Fee</div>
            <div className="text-sm">{Number(appt?.fee ?? 2500).toLocaleString()}</div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Booked&nbsp;</span>{formatDate(appt.createdAt)}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <CheckCircle size={16} />
            Paid
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaidAppointments() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [sessionMap, setSessionMap] = useState({});
  const [filter, setFilter] = useState("all"); // "all" | "scheduled" | "not-scheduled"

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const res = await getAppointments({ status: "accepted" });
        const data = res?.data?.appointments ?? [];
        const list = Array.isArray(data) ? data : [];
        const filtered = list.filter((appt) => appt?.paymentStatus === "success");
        if (mounted) setAppointments(filtered);

        // Check session existence for each appointment in parallel
        const entries = await Promise.all(
          filtered.map(async (appt) => {
            try {
              await getSessionByAppointmentId(appt._id);
              return [appt._id, true];
            } catch (err) {
              const status = err?.response?.status;
              const msg = (err?.response?.data?.message || err?.message || "").toLowerCase();
              if (status === 404 || msg.includes("not found")) {
                return [appt._id, false];
              }
              return [appt._id, false];
            }
          })
        );
        if (mounted) setSessionMap(Object.fromEntries(entries));
      } catch (err) {
        if (mounted) setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const visibleAppointments = appointments.filter((appt) => {
    if (filter === "scheduled") return sessionMap[appt._id] === true;
    if (filter === "not-scheduled") return sessionMap[appt._id] === false;
    return true;
  });

  if (loading) return <div className="pt-4 text-sm text-muted-foreground">Loading paid appointments...</div>;
  if (error) return <div className="pt-4 text-sm text-destructive">Error: {error}</div>;
  if (!appointments.length) return <div className="pt-4 text-sm text-muted-foreground">No paid appointments yet.</div>;

  const filters = [
    { key: "all", label: "All" },
    { key: "not-scheduled", label: "Meeting Not Scheduled" },
    { key: "scheduled", label: "Meeting Scheduled" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {visibleAppointments.length === 0 ? (
        <div className="pt-2 text-sm text-muted-foreground">No appointments match this filter.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleAppointments.map((appt) => (
            <Link key={appt._id} to={`/doctor/appointments/detail/${appt._id}`} className="block no-underline hover:opacity-95">
              <AppointmentCard appt={appt} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

