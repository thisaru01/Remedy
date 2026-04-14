import { useEffect, useState } from "react";
import { getSessionByAppointmentId, getSessionJoinDetails } from "@/api/services/telemedicineService";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

export default function MeetingsTab({ appointmentId }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

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

  if (loading) return <div className="text-sm text-muted-foreground">Loading meetings...</div>;
  if (error) return <div className="text-sm text-destructive">Error: {error}</div>;
  if (!session) return <div className="text-sm text-muted-foreground">No meetings scheduled for this appointment.</div>;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Status:</span>
        <span className="text-sm capitalize font-medium">{session.status}</span>
      </div>
      <div>
        <Button
          size="sm"
          className="gap-1.5"
          disabled={joining}
          onClick={handleJoin}
        >
          <Video size={15} />
          {joining ? "Joining..." : "Join Meeting"}
        </Button>
      </div>
    </div>
  );
}

