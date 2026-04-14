import { useEffect, useState } from "react";
import { getAppointments } from "@/api/services/appointmentService";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

function formatDate(dt) {
  try {
    return new Date(dt).toLocaleString();
  } catch (e) {
    return dt;
  }
}

export default function PaidAppointments() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const res = await getAppointments({ status: "accepted" });
        const data = res?.data?.appointments ?? [];
        const list = Array.isArray(data) ? data : [];
        const filtered = list.filter(
          (appt) => appt?.paymentStatus === "success",
        );
        if (mounted) setAppointments(filtered);
      } catch (err) {
        if (mounted) setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="pt-4 text-sm text-muted-foreground">Loading paid appointments...</div>;
  if (error) return <div className="pt-4 text-sm text-destructive">Error: {error}</div>;
  if (!appointments.length) return <div className="pt-4 text-sm text-muted-foreground">No paid appointments yet.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {appointments.map((appt) => (
        <Card key={appt._id}>
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
            <div className="flex items-center justify-end mt-4">
              <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <CheckCircle size={16} />
                Paid
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
