import { useParams } from "react-router-dom";
import PaymentButton from "@/components/PaymentButton";

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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {label} Appointments
        </h1>
        <p className="text-sm text-muted-foreground">
          List of your {label.toLowerCase()} appointments will appear here.
        </p>
      </div>

      {status === "approved" && (
        <div className="p-6 border rounded-xl bg-card shadow-sm max-w-sm space-y-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Test Payment Flow</h3>
            <p className="text-sm text-muted-foreground">
              This block is for testing your payment service integration.
            </p>
          </div>
          
          <PaymentButton />

          {!import.meta.env.VITE_TEST_APPOINTMENT_ID && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
              Note: Set <code className="font-bold">VITE_TEST_APPOINTMENT_ID</code> in your <code className="font-bold">.env</code> to enable this button.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
