import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  getOwnSchedules,
  createSchedule,
  updateSchedule,
  updateAvailability,
} from "@/api/services/scheduleService";

export const useDoctorSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getOwnSchedules();
      if (response.data.success) {
        setSchedules(response.data.schedules);
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch schedules";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addNewSchedule = async (scheduleData) => {
    setLoading(true);
    try {
      const response = await createSchedule(scheduleData);
      if (response.data.success) {
        toast.success("Schedule created successfully");
        await fetchSchedules(); // Refresh list
        return true;
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create schedule";
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const editSchedule = async (scheduleId, scheduleData) => {
    setLoading(true);
    try {
      const response = await updateSchedule(scheduleId, scheduleData);
      if (response.data.success) {
        toast.success("Schedule updated successfully");
        await fetchSchedules();
        return true;
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update schedule";
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (scheduleId, currentAvailability) => {
    try {
      // Optimistic UI update
      setSchedules((prev) =>
        prev.map((s) =>
          s._id === scheduleId ? { ...s, isAvailable: !currentAvailability } : s
        )
      );

      const response = await updateAvailability(scheduleId, !currentAvailability);
      if (!response.data.success) {
        throw new Error("Failed to update availability");
      }
      toast.success(`Schedule is now ${!currentAvailability ? "available" : "unavailable"}`);
    } catch (err) {
      // Rollback on error
      setSchedules((prev) =>
        prev.map((s) =>
          s._id === scheduleId ? { ...s, isAvailable: currentAvailability } : s
        )
      );
      const message = err.response?.data?.message || "Failed to update availability";
      toast.error(message);
    }
  };

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    addNewSchedule,
    editSchedule,
    toggleAvailability,
  };
};
