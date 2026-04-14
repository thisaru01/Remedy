import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { getSchedulesByDoctor } from "@/api/services/scheduleService";
import { cancelAppointment } from "@/api/services/appointmentService";
import { getDoctorDetails } from "@/api/services/doctorService";
import { useEffect, useState } from "react";
import { getSchedule } from "@/api/services/scheduleService";
import PaymentButton from "@/patients/components/PaymentButton";
import { toast } from "sonner";

function formatDate(dt) {
  try {
    return new Date(dt).toLocaleString();
  } catch (e) {
    return dt;
  }
}

function formatDoctorDisplay(appt) {
  // appointment may include doctor info in several shapes: { doctorId: 'id' } or
  // { doctorId: { _id, name, firstName, lastName } } or { doctorName }
  const d = appt?.doctor || appt?.doctorId || null;

  if (!d) return "-";

  if (typeof d === "string") {
    // fallback to doctorName property if present
    if (typeof appt?.doctorName === "string") return `Dr. ${appt.doctorName}`;
    return d;
  }

  // object
  if (typeof d === "object") {
    if (typeof d.name === "string" && d.name.trim()) return `Dr. ${d.name}`;
    const first = d.firstName || d.first || "";
    const last = d.lastName || d.last || "";
    const full = `${first} ${last}`.trim();
    if (full) return `Dr. ${full}`;
    if (typeof d._id === "string") return d._id;
  }
}

function formatDoctorSpecialty(appt) {
  const d = appt?.doctor || appt?.doctorId || null;
  // direct fields on appointment
  if (typeof appt?.doctorSpecialty === "string" && appt.doctorSpecialty.trim()) return appt.doctorSpecialty;
  if (typeof appt?.specialty === "string" && appt.specialty.trim()) return appt.specialty;

  if (!d) return null;

  if (typeof d === "object") {
    if (typeof d.specialty === "string" && d.specialty.trim()) return d.specialty;
    if (typeof d.specialization === "string" && d.specialization.trim()) return d.specialization;
    if (Array.isArray(d.specialties) && d.specialties.length) return d.specialties.join(", ");
    if (Array.isArray(d.specialities) && d.specialities.length) return d.specialities.join(", ");
  }

  return null;
}

export default function AppointmentCard({ appt, action = "cancel" }) {
  const [schedule, setSchedule] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [schedulesList, setSchedulesList] = useState([]);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!appt?.scheduleId) return;
      try {
        setLoadingSchedule(true);
        const res = await getSchedule(appt.scheduleId);
        const data = res?.data?.schedule ?? res?.data;
        if (mounted) setSchedule(data);
      } catch (e) {
        // ignore schedule fetch errors silently
      } finally {
        if (mounted) setLoadingSchedule(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [appt?.scheduleId]);

  useEffect(() => {
    // load schedules for the appointment's doctor so the reschedule dialog lists only those
    let mounted = true;
    const loadDoctorSchedules = async () => {
      try {
        const doctorId = typeof appt?.doctorId === "string" ? appt.doctorId : (appt?.doctor && appt.doctor._id) || null;
        if (!doctorId) return;
        const res = await getSchedulesByDoctor(doctorId);
        const data = res?.data?.schedules ?? res?.data ?? [];
        if (mounted) setSchedulesList(Array.isArray(data) ? data : []);
      } catch (e) {
        // ignore
      }
    };

    loadDoctorSchedules();
    return () => {
      mounted = false;
    };
  }, [appt?.doctorId, appt?.doctor]);

  useEffect(() => {
    let mounted = true;
    const loadDoctor = async () => {
      try {
        // Prefer the schedule's doctorUserId when available (it's the auth user id)
        const doctorUserId = schedule?.doctorUserId || (typeof appt?.doctorId === "string" ? appt.doctorId : (appt?.doctor && appt.doctor._id) || null);
        if (!doctorUserId) return;
        const res = await getDoctorDetails(doctorUserId);
        const payload = res?.data ?? {};
        let data = payload.profile ?? payload.doctor ?? payload;
        if (data?.profile) data = data.profile;
        if (mounted) setDoctorDetails(data || null);
      } catch (e) {
        // ignore doctor fetch errors
      }
    };

    loadDoctor();
    return () => {
      mounted = false;
    };
  }, [appt?.doctorId, appt?.doctor, schedule]);

  const isClickable = appt?.status === "accepted" && appt?.paymentStatus === "success";

  const handleCancel = async () => {
    if (!appt?._id) return;
    try {
      setCancelling(true);
      await cancelAppointment(appt._id);
      setCancelled(true);
      toast.success("Appointment cancelled");
    } catch (err) {
      console.error("Failed to cancel appointment", err);
      toast.error(err?.message || "Failed to cancel appointment");
    } finally {
      setCancelling(false);
      setConfirmOpen(false);
    }
  };

  if (cancelled) return null;

  return (
    <>
    <Card className={isClickable ? "transition-transform duration-150 ease-in-out hover:-translate-y-1 hover:shadow-lg cursor-pointer" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            {schedule && (
              <div className="text-sm font-semibold text-primary">
                {schedule.day} · {schedule.startTime}{schedule.endTime ? ` - ${schedule.endTime}` : ""}
              </div>
            )}
          </div>
          <div className="text-right">
            {appt?.appointmentNumber && (
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-primary text-primary-foreground font-semibold">
                {appt.appointmentNumber}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <div className="text-xs text-muted-foreground">Doctor</div>
            <div className="text-sm">{doctorDetails?.doctorName ? `Dr. ${doctorDetails.doctorName}` : (doctorDetails?.name ? `Dr. ${doctorDetails.name}` : formatDoctorDisplay(appt))}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Specialty</div>
            <div className="text-sm">{doctorDetails?.specialty ?? doctorDetails?.specialization ?? formatDoctorSpecialty(appt) ?? "-"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Fee</div>
            <div className="text-sm">{Number(appt?.fee ?? 2500).toLocaleString()}</div>
          </div>
          {/* schedule removed per request */}
        </div>
      </CardContent>
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">{formatDate(appt.createdAt)}</div>
          <div>
            {action === "pay" ? (
              <PaymentButton appointmentId={appt._id} />
            ) : action === "delete" ? (
              <Button variant="destructive" size="sm" type="button">Delete</Button>
            ) : appt?.status === "completed" || appt?.paymentStatus === "success" ? (
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border border-emerald-200 bg-emerald-50 text-emerald-600 font-semibold">
                <CheckCircle size={14} className="text-emerald-600" />
                <span className="text-xs font-medium">Paid</span>
              </div>
            ) : appt?.status === "pending" ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    // preselect current values
                    const docVal = (typeof appt?.doctorId === "string" && appt.doctorId) || (typeof appt?.doctor === "object" && appt.doctor?._id) || "";
                    setSelectedDoctor(docVal);
                    setSelectedSchedule(appt?.scheduleId || "");
                    setRescheduleOpen(true);
                  }}
                >
                  Reschedule
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel"}
                </Button>
              </div>
            ) : (
              <Button variant="destructive" size="sm" type="button">Cancel</Button>
            )}
          </div>
        </div>
      </div>
    </Card>

    <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        <div className="px-2 mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`doctor-${appt._id}`}>Doctor</Label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger id={`schedule-${appt._id}`} className="w-full">
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent>
                {schedulesList.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.day} · {s.startTime}{s.endTime ? ` - ${s.endTime}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <div />
          <Button size="sm" onClick={() => setRescheduleOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
          <AlertDialogDescription>
            This will move the appointment to your cancelled list. You can&apos;t undo this action.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelling}>Keep appointment</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Yes, cancel"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
