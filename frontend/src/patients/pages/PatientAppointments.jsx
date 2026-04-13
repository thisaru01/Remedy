import { useParams } from "react-router-dom";
import PendingAppointments from "@/patients/components/PendingAppointments.jsx";

const LABELS = {
  approved: "Approved",
  pending: "Pending",
  completed: "Completed",
  rejected: "Rejected",
  canceled: "Canceled",
};

export default function PatientAppointments() {
  const { status } = useParams();
  const label = LABELS[status] ?? "All";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{label} Appointments</h1>
        <p className="text-sm text-muted-foreground">
          List of your {label.toLowerCase()} appointments will appear here.
        </p>
      </div>

      {status === "pending" && <PendingAppointments />}
    </div>
  );
}
