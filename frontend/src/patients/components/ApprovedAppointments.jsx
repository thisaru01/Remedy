import { useEffect, useState } from "react";
import { getAppointments } from "@/api/services/appointmentService";
import AppointmentCard from "./AppointmentCard.jsx";

export default function ApprovedAppointments() {
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
          (appt) => appt?.status === "accepted" && appt?.paymentStatus === "pending",
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

  if (loading) return <div className="pt-4 text-sm text-muted-foreground">Loading approved appointments...</div>;
  if (error) return <div className="pt-4 text-sm text-destructive">Error: {error}</div>;
  if (!appointments.length) return <div className="pt-4 text-sm text-muted-foreground">No approved appointments with pending payment.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {appointments.map((appt) => (
        <AppointmentCard key={appt._id} appt={appt} action="pay" />
      ))}
    </div>
  );
}
