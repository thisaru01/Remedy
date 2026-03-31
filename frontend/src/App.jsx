import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Admin
import AdminRouteLayout from "./admin/AdminRouteLayout.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import AdminProfile from "./admin/pages/AdminProfile.jsx";
import AdminUsers from "./admin/pages/AdminUsers.jsx";

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
      </Routes>
    </BrowserRouter>
  );
}
