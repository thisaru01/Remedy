import { useState, useCallback, useEffect } from "react";
import { 
  getDoctorsByStatus, 
  approveDoctorVerification, 
  rejectDoctorVerification 
} from "@/api/services/adminService";

export const useAdminVerifications = (initialStatus = "submitted") => {
  const [doctors, setDoctors] = useState([]);
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // stores ID of doctor being updated

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getDoctorsByStatus(status);
      // Backend returns { verificationStatus, profiles }
      setDoctors(response.data?.profiles || []);
      setError(null);
    } catch (err) {
      setError(err?.message || "Failed to fetch doctor verifications");
    } finally {
      setLoading(false);
    }
  }, [status]);

  const approveDoctor = async (userId) => {
    try {
      setActionLoading(userId);
      await approveDoctorVerification(userId);
      // Remove from list or refresh
      setDoctors((prev) => prev.filter((d) => d.userId !== userId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message };
    } finally {
      setActionLoading(null);
    }
  };

  const rejectDoctor = async (userId) => {
    try {
      setActionLoading(userId);
      await rejectDoctorVerification(userId);
      // Remove from list or refresh
      setDoctors((prev) => prev.filter((d) => d.userId !== userId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message };
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return {
    doctors,
    status,
    setStatus,
    loading,
    error,
    actionLoading,
    approveDoctor,
    rejectDoctor,
    refresh: fetchDoctors,
  };
};
