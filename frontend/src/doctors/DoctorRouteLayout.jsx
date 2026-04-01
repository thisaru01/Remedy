import { Navigate, Outlet, useLocation } from "react-router-dom";

import { DoctorLayout } from "@/doctors/DoctorLayout";
import { useAuth } from "@/context/auth/useAuth";
import { getDashboardPathForRole } from "@/context/auth/authRouting";

export default function DoctorRouteLayout() {
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (role !== "doctor") {
    return <Navigate to={getDashboardPathForRole(role)} replace />;
  }

  return (
    <DoctorLayout sidebarProps={{ activeHref: location.pathname }}>
      <Outlet />
    </DoctorLayout>
  );
}
