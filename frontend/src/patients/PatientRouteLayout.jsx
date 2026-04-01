import { Navigate, Outlet, useLocation } from "react-router-dom";

import { PatientLayout } from "@/patients/PatientLayout";
import { useAuth } from "@/context/auth/useAuth";
import { getDashboardPathForRole } from "@/context/auth/authRouting";

export default function PatientRouteLayout() {
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (role !== "patient") {
    return <Navigate to={getDashboardPathForRole(role)} replace />;
  }

  return (
    <PatientLayout sidebarProps={{ activeHref: location.pathname }}>
      <Outlet />
    </PatientLayout>
  );
}
