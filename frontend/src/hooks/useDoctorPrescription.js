import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  createDoctorPrescription,
  getDoctorPrescriptionByAppointmentId,
} from "@/api/services/doctorPrescriptionService";

export const useDoctorPrescription = (appointmentId) => {
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrescription = useCallback(async () => {
    if (!appointmentId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await getDoctorPrescriptionByAppointmentId(appointmentId);
      setPrescription(response.data?.prescription || response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        // Not found is fine, it means no prescription exists yet (form mode)
        setPrescription(null);
      } else {
        const msg = err.response?.data?.message || "Failed to fetch prescription details.";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  const submitPrescription = async (payload) => {
    if (!appointmentId) return false;
    
    setSubmitting(true);
    try {
      // Backend expects status: 'finalized' to actually lock it in.
      const dataToSubmit = { ...payload, status: "finalized" };
      const response = await createDoctorPrescription(appointmentId, dataToSubmit);
      
      setPrescription(response.data?.prescription || response.data);
      toast.success("Prescription has been created successfully!");
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create prescription.";
      toast.error(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    prescription,
    loading,
    submitting,
    error,
    fetchPrescription,
    submitPrescription
  };
};
