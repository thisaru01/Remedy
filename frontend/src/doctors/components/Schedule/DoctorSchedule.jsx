import React, { useEffect, useState, useMemo } from "react";
import { 
  Plus, 
  Calendar, 
  Clock,
  AlertCircle,
  Loader2,
  CalendarDays,
  Activity
} from "lucide-react";
import { useDoctorSchedule } from "@/hooks/useDoctorSchedule";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_SLOTS = [
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM",
  "08:00 PM"
];

const calculateEndTime = (startTime) => {
  if (!startTime) return "";
  const match = startTime.match(/(\d{2}):(\d{2})\s(AM|PM)/);
  if (!match) return startTime;
  
  let hours = parseInt(match[1]);
  const minutes = match[2];
  let ampm = match[3];

  if (hours === 12) {
    hours = 0;
  }
  if (ampm === "PM") {
    hours += 12;
  }

  hours += 2; // Fixed 2-hour duration

  let endAmpm = hours >= 12 && hours < 24 ? "PM" : "AM";
  let endHours = hours % 12;
  if (endHours === 0) endHours = 12;

  const paddedHours = endHours.toString().padStart(2, "0");
  
  return `${paddedHours}:${minutes} ${endAmpm}`;
};

const DoctorScheduleCreate = () => {
  const { profile } = useDoctorProfile();
  const { 
    schedules, 
    loading, 
    fetchSchedules, 
    addNewSchedule, 
    toggleAvailability 
  } = useDoctorSchedule();

  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedTime, setSelectedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const stats = useMemo(() => {
    return {
      weeklyTotal: schedules.length
    };
  }, [schedules]);

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!selectedTime) {
      toast.error("Please select a time slot");
      return;
    }

    if (profile?.verification?.status !== "approved") {
      toast.error("Your profile must be approved to create schedules");
      return;
    }

    setIsSubmitting(true);
    const success = await addNewSchedule({
      day: selectedDay,
      startTime: selectedTime,
      isAvailable: true,
    });
    
    if (success) {
      setSelectedTime("");
    }
    setIsSubmitting(false);
  };

  const activeSchedules = useMemo(() => {
    return schedules.filter(s => s.day === selectedDay).sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
  }, [schedules, selectedDay]);

  const isVerified = profile?.verification?.status === "approved";

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Doctor Schedules</h1>
        <p className="text-muted-foreground text-sm">
          Manage your consultation hours and patient availability.
        </p>
      </div>

      <div className="flex bg-muted/40 p-1.5 rounded-lg border w-fit overflow-x-auto max-w-full">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={cn(
              "px-5 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap",
              selectedDay === day 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Actions Module (Left) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Slot
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isVerified && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-amber-800">
                    Your profile must be approved by an administrator before you can schedule slots.
                  </p>
                </div>
              )}

              <form onSubmit={handleAddSchedule} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selected Day</label>
                  <div className="w-full px-3 py-2 bg-muted/50 border rounded-md text-sm font-medium text-foreground">
                    {selectedDay}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <div className="relative">
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full h-10 px-3 bg-background border rounded-md text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      disabled={!isVerified}
                    >
                      <option value="">Select time...</option>
                      {TIME_SLOTS.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedTime || !isVerified}
                  className="w-full font-semibold"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Schedule Slot
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-muted/20">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Weekly Slots</p>
                <p className="text-2xl font-bold">{stats.weeklyTotal}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Module (Right) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
             <h2 className="text-xl font-semibold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                {selectedDay} Roster
             </h2>
             <Badge variant="secondary" className="font-mono bg-muted/50">
               {activeSchedules.length} Slots
             </Badge>
          </div>

          <div className="space-y-3">
            {activeSchedules.length > 0 ? (
              activeSchedules.map((slot) => {
                const endTime = calculateEndTime(slot.startTime);
                return (
                <div 
                  key={slot._id}
                  className="bg-card border rounded-lg p-4 hover:shadow-sm transition-shadow flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-base font-semibold">{slot.startTime} - {endTime}</div>
                      <div className="text-sm text-muted-foreground">{slot.slotCount || 6} Patient Capacity</div>
                    </div>
                  </div>

                  <Button
                    variant={slot.isAvailable ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleAvailability(slot._id, slot.isAvailable)}
                    className={cn(
                      "font-medium min-w-[100px]",
                      slot.isAvailable 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {slot.isAvailable ? "Available" : "Unavailable"}
                  </Button>
                </div>
                );
              })
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center bg-muted/20 border border-dashed rounded-lg">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="text-base font-medium text-foreground">No slots available for {selectedDay}</h4>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  You haven't added any consultation hours for this day yet. Use the panel on the left to add your first slot.
                </p>
              </div>
            )}
          </div>

          {activeSchedules.length > 0 && (
             <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 text-blue-800">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">
                   <strong>Standard Practice Note:</strong> Each added slot represents a 2-hour consultation window according to standard clinic guidelines. Patient appointments will be spaced evenly within this block.
                </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorScheduleCreate;

