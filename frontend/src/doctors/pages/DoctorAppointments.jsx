import { useParams } from "react-router-dom";
import PaidAppointments from "@/doctors/components/PaidAppointments.jsx";

const LABELS = {
  pending: "Pending",
  approved: "Approved",
  paid: "Paid",
  completed: "Completed",
  rejected: "Rejected",
};

export default function DoctorAppointments() {
  const { status } = useParams();
  const label = LABELS[status] ?? "All";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{label} Appointments</h1>
        <p className="text-sm text-muted-foreground">
          Your {label.toLowerCase()} appointments with patients will appear here.
        </p>
      </div>

      {status === "paid" && <PaidAppointments />}
    </div>
  );
}
