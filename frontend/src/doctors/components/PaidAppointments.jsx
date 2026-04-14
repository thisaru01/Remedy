import { useEffect, useState } from "react";
import { getAppointments } from "@/api/services/appointmentService";
import { createSession, getSessionJoinDetails, getSessionByAppointmentId } from "@/api/services/telemedicineService";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle, Video } from "lucide-react";

function formatDate(dt) {
  try {
    return new Date(dt).toLocaleString();
  } catch (e) {
    return dt;
  }
}

function AppointmentCard({ appt, meetingState, onCreateMeeting, onJoinMeeting }) {
  const state = meetingState[appt._id] ?? {};
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">{formatDate(appt.createdAt)}</div>
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
        <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <CheckCircle size={16} />
            Paid
          </div>
          {state.sessionId ? (
            <Button
              size="sm"
              variant="default"
              className="gap-1.5"
              disabled={state.joining}
              onClick={() => onJoinMeeting(appt._id, state.sessionId)}
            >
              <Video size={15} />
              {state.joining ? "Joining..." : "Join Meeting"}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={state.loading}
              onClick={() => onCreateMeeting(appt)}
            >
              <Video size={15} />
              {state.loading ? "Creating..." : "Create Meeting"}
            </Button>
          )}
        </div>
        {state.error && (
          <div className="mt-2 text-xs text-destructive">{state.error}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PaidAppointments() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [meetingState, setMeetingState] = useState({});

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

        const sessionChecks = await Promise.allSettled(
          filtered.map((appt) => getSessionByAppointmentId(appt._id))
        );
        if (mounted) {
          const initial = {};
          filtered.forEach((appt, i) => {
            const result = sessionChecks[i];
            if (result.status === "fulfilled") {
              const sessionId = result.value?.data?.data?._id;
              if (sessionId) {
                initial[appt._id] = { loading: false, joining: false, error: null, sessionId };
              }
            }
          });
          setMeetingState(initial);
        }
      } catch (err) {
        if (mounted) setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const handleCreateMeeting = async (appt) => {
    const id = appt._id;
    setMeetingState((prev) => ({ ...prev, [id]: { loading: true, joining: false, error: null, sessionId: null } }));
    try {
      const createRes = await createSession({
        appointmentId: id,
        patientId: String(appt.patientId),
        doctorId: String(appt.doctorId),
      });
      const sessionId = createRes?.data?.data?._id;
      setMeetingState((prev) => ({ ...prev, [id]: { loading: false, joining: false, error: null, sessionId } }));
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to create meeting";
      setMeetingState((prev) => ({ ...prev, [id]: { loading: false, joining: false, error: message, sessionId: null } }));
    }
  };

  const handleJoinMeeting = async (appointmentId, sessionId) => {
    setMeetingState((prev) => ({ ...prev, [appointmentId]: { ...prev[appointmentId], joining: true, error: null } }));
    try {
      const joinRes = await getSessionJoinDetails(sessionId);
      const { joinUrl, token } = joinRes?.data?.data ?? {};
      const authenticatedUrl = token ? `${joinUrl}?jwt=${token}` : joinUrl;
      window.open(authenticatedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to get join link";
      setMeetingState((prev) => ({ ...prev, [appointmentId]: { ...prev[appointmentId], error: message } }));
    } finally {
      setMeetingState((prev) => ({ ...prev, [appointmentId]: { ...prev[appointmentId], joining: false } }));
    }
  };

  if (loading) return <div className="pt-4 text-sm text-muted-foreground">Loading paid appointments...</div>;
  if (error) return <div className="pt-4 text-sm text-destructive">Error: {error}</div>;
  if (!appointments.length) return <div className="pt-4 text-sm text-muted-foreground">No paid appointments yet.</div>;

  const withMeeting = appointments.filter((appt) => meetingState[appt._id]?.sessionId);
  const withoutMeeting = appointments.filter((appt) => !meetingState[appt._id]?.sessionId);

  return (
    <Tabs defaultValue="create">
      <TabsList>
        <TabsTrigger value="create">
          Create Meeting {withoutMeeting.length > 0 && `(${withoutMeeting.length})`}
        </TabsTrigger>
        <TabsTrigger value="meetings">
          Meetings {withMeeting.length > 0 && `(${withMeeting.length})`}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="create" className="mt-4">
        {withoutMeeting.length === 0 ? (
          <div className="text-sm text-muted-foreground">All appointments have meetings created.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {withoutMeeting.map((appt) => (
              <AppointmentCard
                key={appt._id}
                appt={appt}
                meetingState={meetingState}
                onCreateMeeting={handleCreateMeeting}
                onJoinMeeting={handleJoinMeeting}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="meetings" className="mt-4">
        {withMeeting.length === 0 ? (
          <div className="text-sm text-muted-foreground">No meetings created yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {withMeeting.map((appt) => (
              <AppointmentCard
                key={appt._id}
                appt={appt}
                meetingState={meetingState}
                onCreateMeeting={handleCreateMeeting}
                onJoinMeeting={handleJoinMeeting}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

