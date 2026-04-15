import { useParams } from "react-router-dom";
import PaidAppointments from "@/doctors/components/PaidAppointments.jsx";
import PendingAppointments from "@/doctors/components/PendingAppointments.jsx";
import ApprovedAppointments from "@/doctors/components/ApprovedAppointments.jsx";
import CompletedAppointments from "@/doctors/components/CompletedAppointments.jsx";

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
      </div>

      {status === "pending" && <PendingAppointments />}
      {status === "approved" && <ApprovedAppointments />}
      {status === "paid" && <PaidAppointments />}
      {status === "completed" && <CompletedAppointments />}
    </div>
  );
}
