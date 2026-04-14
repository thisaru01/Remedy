import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSchedulesByDoctor } from "@/api/services/scheduleService";
import { createAppointment } from "@/api/services/appointmentService";
import { toast } from "sonner";

export default function BookingDialog({ doctor, open, onOpenChange, onContinue }) {
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);

  const doctorId = doctor?.userId || doctor?.user?._id || doctor?._id || null;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!open) return;
      if (!doctorId) {
        setScheduleError("Unable to load schedules for this doctor.");
        return;
      }

      setLoadingSchedules(true);
      setScheduleError(null);

      try {
        const res = await getSchedulesByDoctor(doctorId);
        const raw = res?.data?.schedules ?? res?.data ?? [];
        const list = Array.isArray(raw)
          ? raw.filter((s) => s?.isAvailable === true && (s.slotCount ?? 0) > 0)
          : [];

        if (!mounted) return;
        setSchedules(list);
        setSelectedScheduleId(list[0]?._id || "");
      } catch (error) {
        console.error("Failed to load doctor schedules", error);
        if (!mounted) return;
        setSchedules([]);
        setSelectedScheduleId("");
        setScheduleError(error?.message || "Failed to load schedules");
      } finally {
        if (mounted) setLoadingSchedules(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [open, doctorId]);

  const handleContinue = async () => {
    if (!selectedScheduleId || !doctorId) return;

    try {
      await createAppointment({ doctorId, scheduleId: selectedScheduleId });
      toast.success("Appointment booked successfully");
      if (onContinue) onContinue(selectedScheduleId);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create appointment", error);
      const message =
        error?.response?.data?.message || error?.message || "Failed to create appointment";
      toast.error(message);
    }
  };

  return (
    <AlertDialog open={!!open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Book appointment</AlertDialogTitle>
          <AlertDialogDescription>
            Select a schedule with available slots for this doctor.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor={`schedule-${doctorId || "doctor"}`}>Schedule</Label>
            {loadingSchedules ? (
              <p className="text-xs text-muted-foreground">Loading schedules...</p>
            ) : scheduleError ? (
              <p className="text-xs text-destructive">{scheduleError}</p>
            ) : schedules.length === 0 ? (
              <p className="text-xs text-muted-foreground">No schedules with available slots were found for this doctor.</p>
            ) : (
              <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
                <SelectTrigger id={`schedule-${doctorId || "doctor"}`} className="w-full">
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  {schedules.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.day} · {s.startTime}
                      {s.endTime ? ` - ${s.endTime}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <AlertDialogAction disabled={loadingSchedules || !!scheduleError || !selectedScheduleId} onClick={handleContinue}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
