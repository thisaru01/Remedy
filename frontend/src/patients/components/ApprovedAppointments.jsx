import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAppointments } from "@/api/services/appointmentService";
import AppointmentCard from "./AppointmentCard.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
        if (mounted) setAppointments(list);
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

  const paidAppointments = appointments.filter(
    (appt) => appt?.status === "accepted" && appt?.paymentStatus === "success",
  );
  const unpaidAppointments = appointments.filter(
    (appt) => appt?.status === "accepted" && appt?.paymentStatus === "pending",
  );

  if (!appointments.length) {
    return <div className="pt-4 text-sm text-muted-foreground">No approved appointments yet.</div>;
  }

  return (
    <Tabs defaultValue="unpaid" className="mt-2">
      <TabsList variant="line">
        <TabsTrigger value="unpaid">Not Paid</TabsTrigger>
        <TabsTrigger value="paid">Paid</TabsTrigger>
      </TabsList>

      <TabsContent value="unpaid" className="mt-4">
        {unpaidAppointments.length === 0 ? (
          <div className="pt-2 text-sm text-muted-foreground">No unpaid approved appointments.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpaidAppointments.map((appt) => (
              <AppointmentCard key={appt._id} appt={appt} action="pay" />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="paid" className="mt-4">
        {paidAppointments.length === 0 ? (
          <div className="pt-2 text-sm text-muted-foreground">No paid approved appointments.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paidAppointments.map((appt) => (
              <Link key={appt._id} to={`/patient/appointments/detail/${appt._id}`} className="block no-underline hover:opacity-95">
                <AppointmentCard appt={appt} />
              </Link>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
