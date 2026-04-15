import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getAppointment, completeAppointment } from "@/api/services/appointmentService";
import { getDoctorPrescriptionByAppointmentId } from "@/api/services/doctorPrescriptionService";
import { getScheduleById } from "@/api/services/doctorService";
import { Button } from "@/components/ui/button";
import CreateMeetingTab from "@/doctors/components/CreateMeetingTab";
import MeetingsTab from "@/doctors/components/MeetingsTab";
import PrescriptionsTab from "@/doctors/components/PrescriptionsTab";
import ReportsTab from "@/doctors/components/ReportsTab";
import { toast } from "sonner";

export default function DoctorAppointmentDetail() {
  const { id: appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loadingAppt, setLoadingAppt] = useState(true);
  const [apptError, setApptError] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [activeTab, setActiveTab] = useState("create-meeting");
  const [hasPrescription, setHasPrescription] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

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

  useEffect(() => {
    if (!appointmentId) return;

    getDoctorPrescriptionByAppointmentId(appointmentId)
      .then((res) => {
        const prescription = res?.data?.prescription ?? res?.data ?? null;
        setHasPrescription(Boolean(prescription));
      })
      .catch((err) => {
        const status = err?.response?.status;
        const message = String(err?.response?.data?.message || err?.message || "").toLowerCase();
        const missingPrescription =
          status === 404 ||
          message.includes("not found") ||
          message.includes("no prescription");

        if (missingPrescription) {
          setHasPrescription(false);
          return;
        }

        setHasPrescription(false);
      });
  }, [appointmentId]);

  const handleCompleteAppointment = async () => {
    if (!appointmentId) return;

    try {
      setIsCompleting(true);
      const response = await completeAppointment(appointmentId);
      const updatedAppointment = response?.data?.appointment ?? response?.data ?? null;
      if (updatedAppointment) {
        setAppointment(updatedAppointment);
      }
      toast.success("Appointment marked as completed.");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to complete appointment";
      toast.error(msg);
    } finally {
      setIsCompleting(false);
    }
  };

  const isAlreadyCompleted = appointment?.status === "completed";
  const canCompleteAppointment =
    appointment?.status === "accepted" &&
    appointment?.paymentStatus === "success" &&
    hasPrescription &&
    !isCompleting;

  const completionHint = isAlreadyCompleted
    ? "This appointment is already completed."
    : appointment?.status !== "accepted"
      ? "Only accepted appointments can be completed."
      : appointment?.paymentStatus !== "success"
        ? "Payment must be successful before completing the appointment."
        : !hasPrescription
          ? "Submit the prescription first, then complete the appointment from Reports."
          : "After reviewing patient reports, click Complete Appointment.";

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
              schedule={schedule}
              createdAt={appointment?.createdAt}
              onMeetingCreated={() => setActiveTab("meetings")}
            />
          </TabsContent>

          <TabsContent value="meetings" className="mt-4">
            {schedule && (
              <div className="mb-3 rounded-lg border px-4 py-3 text-sm">
                <span className="font-medium capitalize">{schedule.day}</span>
                <span className="text-muted-foreground"> · {schedule.startTime} – {schedule.endTime}</span>
                {appointment?.createdAt && (() => {
                  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
                  const targetDay = days.indexOf(schedule.day);
                  if (targetDay === -1) return null;
                  const start = new Date(appointment.createdAt);
                  if (isNaN(start.getTime())) return null;
                  const diff = (targetDay - start.getDay() + 7) % 7;
                  const result = new Date(start);
                  result.setDate(start.getDate() + diff);
                  const dateStr = result.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                  return <span className="ml-2 text-muted-foreground">· <span className="font-medium text-foreground">{dateStr}</span></span>;
                })()}
              </div>
            )}
            <MeetingsTab appointmentId={appointmentId} patientId={appointment?.patientId} />
          </TabsContent>

          <TabsContent value="prescriptions" className="mt-4">
            <PrescriptionsTab 
              appointment={appointment} 
              appointmentId={appointmentId} 
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <ReportsTab appointmentId={appointmentId} />
            <div className="mt-4 rounded-lg border bg-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Complete this appointment</p>
                  <p className="text-xs text-muted-foreground">{completionHint}</p>
                </div>
                <Button
                  type="button"
                  onClick={handleCompleteAppointment}
                  disabled={!canCompleteAppointment || isAlreadyCompleted}
                >
                  {isCompleting ? "Completing..." : isAlreadyCompleted ? "Completed" : "Complete Appointment"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
