import { useEffect, useState } from "react";
import { getSessionByAppointmentId, getSessionJoinDetails } from "@/api/services/telemedicineService";
import { getAppointment } from "@/api/services/appointmentService";
import { getSchedule } from "@/api/services/scheduleService";
import { getDoctorDetails } from "@/api/services/doctorService";
import { Button } from "@/components/ui/button";
import { Video, UserRound, CalendarDays, Clock } from "lucide-react";

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

export default function MeetingsTab({ appointmentId }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [scheduleInfo, setScheduleInfo] = useState(null);
  const [scheduledDate, setScheduledDate] = useState(null);
  const [doctorName, setDoctorName] = useState(null);

  useEffect(() => {
    if (!appointmentId) return;

    let mounted = true;
    setLoading(true);

    getSessionByAppointmentId(appointmentId)
      .then((res) => {
        if (mounted) setSession(res?.data?.data ?? null);
      })
      .catch((err) => {
        const status = err?.response?.status;
        const message = (err?.response?.data?.message || err?.message || "").toLowerCase();
        const isNotFound = status === 404 || message.includes("not found");
        if (!isNotFound && mounted) {
          setError(err?.response?.data?.message || err?.message || "Failed to load session");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [appointmentId]);

  useEffect(() => {
    if (!appointmentId) return;
    let mounted = true;

    getAppointment(appointmentId)
      .then((res) => {
        const appt = res?.data?.appointment ?? res?.data?.data ?? res?.data ?? null;
        if (!appt || !mounted) return;
        const scheduleId = appt.scheduleId;
        const createdAt = appt.createdAt;
        const doctorId = typeof appt.doctorId === "string" ? appt.doctorId : appt.doctorId?._id ?? null;

        if (doctorId) {
          getDoctorDetails(doctorId)
            .then((dRes) => {
              const d = dRes?.data?.profile ?? dRes?.data?.doctor ?? dRes?.data ?? null;
              const name = d?.doctorName || d?.name ||
                (`${d?.firstName || ""} ${d?.lastName || ""}`).trim() || null;
              if (name && mounted) setDoctorName(`Dr. ${name}`);
            })
            .catch(() => {});
        }

        if (!scheduleId || !createdAt) return;
        return getSchedule(scheduleId).then((sRes) => {
          const schedule = sRes?.data?.schedule ?? sRes?.data ?? null;
          if (!schedule || !mounted) return;
          setScheduleInfo(schedule);
          const date = getNextScheduledDate(createdAt, schedule.day);
          setScheduledDate(date);
        });
      })
      .catch(() => {
        // silently ignore — scheduled date is informational only
      });

    return () => { mounted = false; };
  }, [appointmentId]);

  const handleJoin = async () => {
    setJoining(true);
    setError(null);
    try {
      const res = await getSessionJoinDetails(session._id);
      const { joinUrl, token } = res?.data?.data ?? {};
      const authenticatedUrl = token ? `${joinUrl}?jwt=${token}` : joinUrl;
      window.open(authenticatedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to get join link");
    } finally {
      setJoining(false);
    }
  };

  if (loading) return (
    <div className="rounded-lg border p-6 text-sm text-muted-foreground">
      Loading meeting details...
    </div>
  );
  if (error) return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      {error}
    </div>
  );
  if (!session) return (
    <div className="rounded-lg border p-6 text-sm text-muted-foreground text-center">
      No meeting has been scheduled for this appointment yet.
    </div>
  );

  const statusStyles = session.status === "scheduled"
    ? "bg-foreground text-background"
    : session.status === "active"
    ? "bg-foreground text-background"
    : "bg-muted text-muted-foreground";

  return (
    <div className="rounded-lg border overflow-hidden max-w-sm">
      {/* Header bar */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">Meeting Details</h3>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles}`}>
          <span className="size-1.5 rounded-full bg-current opacity-70" />
          {session.status}
        </span>
      </div>

      {/* Info rows */}
      <div className="px-4 py-3 space-y-2">
        {doctorName && (
          <div className="flex items-center gap-3">
            <UserRound size={15} className="text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground w-20 shrink-0">Doctor</span>
            <span className="text-sm font-medium">{doctorName}</span>
          </div>
        )}
        {scheduleInfo && (
          <div className="flex items-center gap-3">
            <CalendarDays size={15} className="text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground w-20 shrink-0">Schedule</span>
            <span className="text-sm font-medium">
              {scheduleInfo.day} · {scheduleInfo.startTime}{scheduleInfo.endTime ? ` – ${scheduleInfo.endTime}` : ""}
            </span>
          </div>
        )}
        {scheduledDate && (
          <div className="flex items-center gap-3">
            <Clock size={15} className="text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground w-20 shrink-0">Scheduled</span>
            <span className="text-sm font-semibold">{scheduledDate}</span>
          </div>
        )}
      </div>

      {/* Footer action */}
      <div className="border-t px-4 py-3">
        <Button
          size="sm"
          className="gap-2 px-4"
          disabled={joining}
          onClick={handleJoin}
        >
          <Video size={16} />
          {joining ? "Joining..." : "Join Meeting"}
        </Button>
      </div>
    </div>
  );
}

