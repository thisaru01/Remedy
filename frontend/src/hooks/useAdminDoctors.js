import { useState, useEffect, useCallback } from "react";
import * as adminDoctorService from "@/api/services/adminDoctorService";
import { toast } from "sonner";

export const useAdminDoctors = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [rejectedDoctors, setRejectedDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        adminDoctorService.getDoctorsByStatus("submitted"),
        adminDoctorService.getDoctorsByStatus("approved"),
        adminDoctorService.getDoctorsByStatus("rejected"),
      ]);

      setPendingDoctors(pendingRes.data?.profiles || pendingRes.data || []);
      setApprovedDoctors(approvedRes.data?.profiles || approvedRes.data || []);
      setRejectedDoctors(rejectedRes.data?.profiles || rejectedRes.data || []);
      setError(null);
    } catch (err) {
      setError(err?.message || "Failed to fetch doctor lists");
    } finally {
      setLoading(false);
    }
  }, []);

  const approveDoctor = async (id) => {
    try {
      await adminDoctorService.approveDoctorVerification(id);
      toast.success("Doctor verification approved successfully");
      fetchData();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to approve doctor";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const rejectDoctor = async (id) => {
    try {
      await adminDoctorService.rejectDoctorVerification(id);
      toast.success("Doctor verification rejected");
      fetchData();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reject doctor";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    pendingDoctors,
    approvedDoctors,
    rejectedDoctors,
    loading,
    error,
    refreshAll: fetchData,
    approveDoctor,
    rejectDoctor,
  };
};
