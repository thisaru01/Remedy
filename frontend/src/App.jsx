import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Admin
import AdminRouteLayout from "./admin/AdminRouteLayout.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import AdminProfile from "./admin/pages/AdminProfile.jsx";
import AdminUsers from "./admin/pages/AdminUsers.jsx";

// Patient
import PatientRouteLayout from "./patients/PatientRouteLayout.jsx";
import PatientDashboard from "@/patients/pages/PatientDashboard.jsx";
import PatientProfile from "@/patients/pages/PatientProfile.jsx";
import PatientAppointments from "@/patients/pages/PatientAppointments.jsx";
import PatientReports from "@/patients/pages/PatientReports.jsx";
import PatientPrescriptions from "@/patients/pages/PatientPrescriptions.jsx";

// Public
import Home from "@/public/Home.jsx";
import AuthPage from "@/public/AuthPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route path="/admin" element={<AdminRouteLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="users">
            <Route path=":type" element={<AdminUsers />} />
          </Route>
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>

        <Route path="/patient" element={<PatientRouteLayout />}>
          <Route index element={<PatientDashboard />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="appointments">
            <Route path=":status" element={<PatientAppointments />} />
          </Route>
          <Route path="reports">
            <Route path=":type" element={<PatientReports />} />
          </Route>
          <Route path="prescriptions" element={<PatientPrescriptions />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
