import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { getAppointment } from "@/api/services/appointmentService";
import { getScheduleById } from "@/api/services/doctorService";
import { createSession, getSessionByAppointmentId } from "@/api/services/telemedicineService";
import MeetingsTab from "@/patients/components/MeetingsTab";
import PrescriptionsTab from "@/patients/components/PrescriptionsTab";
import ReportsTab from "@/patients/components/ReportsTab";

function CreateMeetingTab({ appointmentId, patientId, doctorId, onMeetingCreated }) {
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

export default function DoctorAppointmentDetail() {
  const { id: appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loadingAppt, setLoadingAppt] = useState(true);
  const [apptError, setApptError] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [activeTab, setActiveTab] = useState("create-meeting");

  useEffect(() => {
    getAppointment(appointmentId)
      .then((res) => {
        const appt = res?.data?.appointment ?? res?.data ?? null;
        setAppointment(appt);
        if (appt?.scheduleId) {
          getScheduleById(appt.scheduleId)
            .then((schedRes) => setSchedule(schedRes?.data?.schedule ?? schedRes?.data ?? null))
            .catch(() => {});
        }
      })
      .catch((err) => setApptError(err?.response?.data?.message || err?.message || "Failed to load appointment"))
      .finally(() => setLoadingAppt(false));
  }, [appointmentId]);

  if (loadingAppt) return <div className="pt-4 text-sm text-muted-foreground">Loading appointment...</div>;
  if (apptError) return <div className="pt-4 text-sm text-destructive">Error: {apptError}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Appointment Details</h2>

      <div className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="line">
            <TabsTrigger value="create-meeting">Create Meeting</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="create-meeting" className="mt-4">
            <CreateMeetingTab
              appointmentId={appointmentId}
              patientId={appointment?.patientId}
              doctorId={appointment?.doctorId}
              onMeetingCreated={() => setActiveTab("meetings")}
            />
          </TabsContent>

          <TabsContent value="meetings" className="mt-4">
            {schedule && (
              <div className="mb-3 rounded-lg border px-4 py-3 text-sm">
                <span className="font-medium capitalize">{schedule.day}</span>
                <span className="text-muted-foreground"> · {schedule.startTime} – {schedule.endTime}</span>
              </div>
            )}
            <MeetingsTab appointmentId={appointmentId} />
          </TabsContent>

          <TabsContent value="prescriptions" className="mt-4">
            <PrescriptionsTab />
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
