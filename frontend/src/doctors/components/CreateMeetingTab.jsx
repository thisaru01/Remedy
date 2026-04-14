import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { createSession, getSessionByAppointmentId } from "@/api/services/telemedicineService";

export default function CreateMeetingTab({ appointmentId, patientId, doctorId, onMeetingCreated }) {
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
