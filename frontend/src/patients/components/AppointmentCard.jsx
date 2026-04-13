import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getSchedule } from "@/api/services/scheduleService";

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

  return "-";
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
            <div className="text-sm">{formatDoctorDisplay(appt)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Specialty</div>
            <div className="text-sm">{formatDoctorSpecialty(appt) ?? "-"}</div>
          </div>
          {/* schedule removed per request */}
        </div>
      </CardContent>
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">{formatDate(appt.createdAt)}</div>
          <div>
            {action === "pay" ? (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm" type="button">Pay Now</Button>
            ) : action === "delete" ? (
              <Button variant="destructive" size="sm" type="button">Delete</Button>
            ) : appt?.status === "completed" || appt?.paymentStatus === "success" ? (
              <CheckCircle size={20} className="text-sky-600" />
            ) : (
              <Button variant="destructive" size="sm" type="button">Cancel</Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
