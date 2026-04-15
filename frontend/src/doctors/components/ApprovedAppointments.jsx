import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import { getAppointments } from "@/api/services/appointmentService";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function formatDate(dt) {
  try {
    return new Date(dt).toLocaleString();
  } catch (error) {
    return dt;
  }
}

function getPatientName(appointment) {
  return (
    appointment?.patientName || appointment?.patient?.name || appointment?.user?.name || String(appointment?.patientId || "-")
  );
}

function AppointmentCard({ appointment }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            {formatDate(appointment.createdAt)}
          </div>
          {appointment?.appointmentNumber && (
            <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {appointment.appointmentNumber}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <div className="text-xs text-muted-foreground">Patient Name</div>
            <div className="text-sm">{getPatientName(appointment)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Fee</div>
            <div className="text-sm">
              {Number(appointment?.fee ?? 2500).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Payment</div>
            <div className="text-sm capitalize">
              {appointment?.paymentStatus || "pending"}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <div className="flex items-center gap-1.5 text-sm font-medium text-sky-600">
            <CheckCircle2 size={16} />
            Approved
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

        // Keep paid appointments in the Paid tab to avoid duplicates.
        const approvedNotPaid = list.filter(
          (appointment) => appointment?.paymentStatus !== "success",
        );

        if (mounted) {
          setAppointments(approvedNotPaid);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || String(err));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="pt-4 text-sm text-muted-foreground">
        Loading approved appointments...
      </div>
    );
  }

  if (error) {
    return <div className="pt-4 text-sm text-destructive">Error: {error}</div>;
  }

  if (!appointments.length) {
    return (
      <div className="pt-4 text-sm text-muted-foreground">
        No approved appointments awaiting payment.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {appointments.map((appointment) => (
        <Link
          key={appointment._id}
          to={`/doctor/appointments/detail/${appointment._id}`}
          className="block no-underline hover:opacity-95"
        >
          <AppointmentCard appointment={appointment} />
        </Link>
      ))}
    </div>
  );
}