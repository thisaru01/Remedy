import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { toast } from "sonner";

import {
  acceptAppointment,
  getAppointments,
  rejectAppointment,
} from "@/api/services/appointmentService";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatDate(dt) {
  try {
    return new Date(dt).toLocaleString();
  } catch (error) {
    return dt;
  }
}

function AppointmentCard({ appointment, onAccept, onReject }) {
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
            <div className="text-xs text-muted-foreground">Patient ID</div>
            <div className="text-sm">{String(appointment.patientId)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Fee</div>
            <div className="text-sm">
              {Number(appointment?.fee ?? 2500).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Payment</div>
            <div className="text-sm capitalize">{appointment?.paymentStatus || "pending"}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <div className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
            <Clock3 size={16} />
            Pending
          </div>
        </div>
      </CardContent>

      <div className="flex flex-wrap gap-2 border-t px-6 py-4">
        <Button
          type="button"
          variant="default"
          className="gap-2"
          onClick={() => onAccept(appointment)}
        >
          <CheckCircle2 className="h-4 w-4" />
          Approve
        </Button>

        <Button
          type="button"
          variant="destructive"
          className="gap-2"
          onClick={() => onReject(appointment)}
        >
          <XCircle className="h-4 w-4" />
          Reject
        </Button>

        <Button asChild type="button" variant="outline" className="ml-auto">
          <Link to={`/doctor/appointments/detail/${appointment._id}`}>
            View Details
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export default function PendingAppointments() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  const refreshAppointments = async () => {
    const res = await getAppointments({ status: "pending" });
    const data = res?.data?.appointments ?? [];
    return Array.isArray(data) ? data : [];
  };

  const handleAccept = async (appointment) => {
    try {
      await acceptAppointment(appointment._id);
      setAppointments((prev) => prev.filter((item) => item._id !== appointment._id));
      toast.success("Appointment approved successfully");
    } catch (err) {
      toast.error(err?.message || "Failed to approve appointment");
    }
  };

  const handleReject = async (appointment) => {
    try {
      await rejectAppointment(appointment._id);
      setAppointments((prev) => prev.filter((item) => item._id !== appointment._id));
      toast.success("Appointment rejected successfully");
    } catch (err) {
      toast.error(err?.message || "Failed to reject appointment");
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await refreshAppointments();
        if (mounted) setAppointments(data);
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
        Loading pending appointments...
      </div>
    );
  }

  if (error) {
    return <div className="pt-4 text-sm text-destructive">Error: {error}</div>;
  }

  if (!appointments.length) {
    return (
      <div className="pt-4 text-sm text-muted-foreground">
        No pending appointments yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment._id}
          appointment={appointment}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      ))}
    </div>
  );
}