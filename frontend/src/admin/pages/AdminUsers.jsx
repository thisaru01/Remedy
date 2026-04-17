import { useParams } from "react-router-dom";
import { DoctorManagement } from "../components/DoctorManagement";
import { PatientManagement } from "../components/PatientManagement";
import { UserAccountManagement } from "../components/UserAccountManagement";

const allowedTypes = new Set(["accounts", "doctors", "patients"]);

export default function AdminUsers() {
  const { type } = useParams();
  const normalizedType = (type ?? "doctors").toLowerCase();

  const safeType = allowedTypes.has(normalizedType)
    ? normalizedType
    : "doctors";

  if (safeType === "accounts") {
    return <UserAccountManagement />;
  }

  if (safeType === "doctors") {
    return <DoctorManagement />;
  }

  if (safeType === "patients") {
    return <PatientManagement />;
  }

  const label = "Doctor";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="text-sm text-muted-foreground">
        Managing {label} accounts.
      </p>
    </div>
  );
}
