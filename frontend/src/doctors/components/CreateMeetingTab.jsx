import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { createSession, getSessionByAppointmentId } from "@/api/services/telemedicineService";

export default function CreateMeetingTab({ appointmentId, patientId, doctorId, schedule, createdAt, onMeetingCreated }) {
  const [checking, setChecking] = useState(true);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!appointmentId) return;

    getSessionByAppointmentId(appointmentId)
      .then((res) => {
        const sid = res?.data?.data?._id;
        if (sid) setAlreadyExists(true);
      })
      .catch((err) => {
        const status = err?.response?.status;
        const message = (err?.response?.data?.message || err?.message || "").toLowerCase();
        const isNotFound = status === 404 || message.includes("not found");
        if (!isNotFound) {
          setError(err?.response?.data?.message || err?.message || "Failed to check session");
        }
      })
      .finally(() => setChecking(false));
  }, [appointmentId]);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      await createSession({
        appointmentId,
        patientId: String(patientId),
        doctorId: String(doctorId),
      });
      onMeetingCreated();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <div className="text-sm text-muted-foreground">Checking meeting status...</div>;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      {error && <div className="text-sm text-destructive">{error}</div>}
      {alreadyExists ? (
        <p className="text-sm text-muted-foreground">
          A meeting has already been created for this appointment. View it in the <strong>Meetings</strong> tab.
        </p>
      ) : (
        <>
          {schedule && createdAt && (() => {
            const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
            const targetDay = days.indexOf(schedule.day);
            if (targetDay === -1) return null;
            const start = new Date(createdAt);
            if (isNaN(start.getTime())) return null;
            const diff = (targetDay - start.getDay() + 7) % 7;
            const result = new Date(start);
            result.setDate(start.getDate() + diff);
            const dateStr = result.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
            return (
              <p className="text-sm text-muted-foreground">
                Meeting will be scheduled on <strong>{schedule.day}, {dateStr}</strong> · {schedule.startTime}{schedule.endTime ? ` – ${schedule.endTime}` : ""}
              </p>
            );
          })()}
          <p className="text-sm text-muted-foreground">No meeting has been created for this appointment yet.</p>
          <Button size="sm" className="gap-1.5" disabled={loading} onClick={handleCreate}>
            <Video size={15} />
            {loading ? "Creating..." : "Create Meeting"}
          </Button>
        </>
      )}
    </div>
  );
}
