import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getSchedule } from "@/api/services/scheduleService";

function formatDate(dt) {
  try {
    return new Date(dt).toLocaleString();
  } catch (e) {
    return dt;
  }
}

export default function AppointmentCard({ appt }) {
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
            <CardTitle>{appt.appointmentNumber || "Appointment"}</CardTitle>
            <CardDescription className="mt-1 text-xs">{formatDate(appt.createdAt)}</CardDescription>
            {schedule && (
              <div className="mt-1 text-xs text-muted-foreground">
                {schedule.day} · {schedule.startTime}{schedule.endTime ? ` - ${schedule.endTime}` : ""}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
              <Badge variant="outline">{appt.status}</Badge>
            </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground">Doctor</div>
            <div className="text-sm">{appt.doctorId ?? "-"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Schedule</div>
            <div className="text-sm">{appt.scheduleId ?? "-"}</div>
          </div>
          {/* notes removed per request */}
        </div>
      </CardContent>

      {/* footer removed per request */}
    </Card>
  );
}
