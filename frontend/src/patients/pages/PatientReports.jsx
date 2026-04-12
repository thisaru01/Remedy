import { useParams } from "react-router-dom";

const LABELS = {
  general: "General",
  appointment: "Appointment",
};

export default function PatientReports() {
  const { type } = useParams();
  const label = LABELS[type] ?? "Reports";

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{label} Reports</h1>
      <p className="text-sm text-muted-foreground">
        Your {label.toLowerCase()} reports will appear here.
      </p>
    </div>
  );
}
