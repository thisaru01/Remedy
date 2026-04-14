import { useEffect, useState } from "react";
import { 
  getOwnDoctorProfile, 
  updateOwnDoctorProfile, 
  submitOwnDoctorVerification 
} from "@/api/services/doctorService";

export const useDoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getOwnDoctorProfile();
      setProfile(response.data?.profile || response.data);
      setError(null);
    } catch (err) {
      setError(err?.message || "Failed to fetch doctor profile");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      setSaving(true);
      const response = await updateOwnDoctorProfile(data);
      setProfile(response.data?.profile || response.data);
      setIsEditing(false);
      setError(null);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err?.message || "Failed to update profile";
      setError(message);
      return { success: false, error: message };
    } finally {
      setSaving(false);
    }
  };

  const submitVerification = async (data) => {
    try {
      setIsVerifying(true);
      const response = await submitOwnDoctorVerification(data);
      setProfile(response.data?.profile || response.data);
      setError(null);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err?.message || "Failed to submit verification";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsVerifying(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    saving,
    isVerifying,
    isEditing,
    toggleEdit,
    updateProfile,
    submitVerification,
    refreshProfile: fetchProfile,
  };
};
