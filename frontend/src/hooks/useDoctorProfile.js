import { useEffect, useState } from "react";
import { getOwnDoctorProfile, updateOwnDoctorProfile } from "@/api/services/doctorService";

export const useDoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getOwnDoctorProfile();
      setProfile(response.data);
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
      setProfile(response.data);
      setIsEditing(false);
      setError(null);
      return { success: true };
    } catch (err) {
      setError(err?.message || "Failed to update profile");
      return { success: false, error: err };
    } finally {
      setSaving(false);
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
    isEditing,
    toggleEdit,
    updateProfile,
    refreshProfile: fetchProfile,
  };
};
