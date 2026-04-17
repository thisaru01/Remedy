import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Admin
import AdminRouteLayout from "./admin/AdminRouteLayout.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import AdminProfile from "./admin/pages/AdminProfile.jsx";
import AdminUsers from "./admin/pages/AdminUsers.jsx";
import AdminTransactions from "./admin/pages/AdminTransactions.jsx";

// Patient
import PatientRouteLayout from "./patients/PatientRouteLayout.jsx";
import PatientDashboard from "@/patients/pages/PatientDashboard.jsx";
import PatientProfile from "@/patients/pages/PatientProfile.jsx";
import PatientAppointments from "@/patients/pages/PatientAppointments.jsx";
import PatientReports from "@/patients/pages/PatientReports.jsx";
import PatientPrescriptions from "@/patients/pages/PatientPrescriptions.jsx";
import PaymentSuccess from "@/patients/pages/PaymentSuccess.jsx";
import PaymentCancel from "@/patients/pages/PaymentCancel.jsx";
import AppointmentDetail from "@/patients/pages/AppointmentDetail.jsx";

// Doctor
import DoctorRouteLayout from "./doctors/DoctorRouteLayout.jsx";
import DoctorDashboard from "@/doctors/pages/DoctorDashboard.jsx";
import DoctorProfile from "@/doctors/pages/DoctorProfile.jsx";
import DoctorAppointments from "@/doctors/pages/DoctorAppointments.jsx";
import DoctorAppointmentDetail from "@/doctors/pages/DoctorAppointmentDetail.jsx";
import DoctorPatientReports from "@/doctors/pages/DoctorPatientReports.jsx";
import DoctorScheduleCreate from "@/doctors/pages/DoctorScheduleCreate.jsx";
import DoctorScheduleManage from "@/doctors/pages/DoctorScheduleManage.jsx";

// Public
import Home from "@/public/Home.jsx";
import AuthPage from "@/public/AuthPage.jsx";
import BookAppointmentsPage from "@/public/book-appointments/BookAppointmentsPage.jsx";
import RemdedyAiPage from "@/public/remedy-ai/RemedyAiPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors closeButton />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/book-appointments" element={<BookAppointmentsPage />} />
        <Route path="/remedy-ai" element={<RemdedyAiPage />} />

        <Route path="/admin" element={<AdminRouteLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="users">
            <Route path=":type" element={<AdminUsers />} />
          </Route>
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>

        <Route path="/patient" element={<PatientRouteLayout />}>
          <Route index element={<PatientDashboard />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="appointments">
            <Route path=":status" element={<PatientAppointments />} />
            <Route path="detail/:id" element={<AppointmentDetail />} />
          </Route>
          <Route path="reports">
            <Route path=":type" element={<PatientReports />} />
          </Route>
          <Route path="prescriptions" element={<PatientPrescriptions />} />
          <Route path="payments">
            <Route path="success" element={<PaymentSuccess />} />
            <Route path="cancel" element={<PaymentCancel />} />
          </Route>
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>

        <Route path="/doctor" element={<DoctorRouteLayout />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="profile" element={<DoctorProfile />} />
          <Route path="appointments">
            <Route path=":status" element={<DoctorAppointments />} />
            <Route path="detail/:id" element={<DoctorAppointmentDetail />} />
          </Route>
          <Route path="patient-reports" element={<DoctorPatientReports />} />
          <Route path="schedule">
            <Route path="create" element={<DoctorScheduleCreate />} />
            <Route path="manage" element={<DoctorScheduleManage />} />
          </Route>
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
