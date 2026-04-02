import { useParams } from "react-router-dom";

const allowedTypes = new Set(["doctor", "patient"]);

export default function AdminUsers() {
  const { type } = useParams();
  const normalizedType = (type ?? "doctor").toLowerCase();

  const safeType = allowedTypes.has(normalizedType) ? normalizedType : "doctor";

  const label =
    safeType === "doctor"
      ? "Doctor"
      : safeType === "patient"
        ? "Patient"
        : "Doctor";

  return (
    <div>
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="mt-2 text-sm text-muted-foreground">Type: {label}</p>
    </div>
  );
}
