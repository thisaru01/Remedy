import React, { useEffect, useState, useMemo } from "react";
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  ChevronRight,
  UserCheck,
  Zap,
  LayoutGrid
} from "lucide-react";
import { useDoctorSchedule } from "@/hooks/useDoctorSchedule";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Enterprise Header Section */}
      <div className="bg-card border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <UserCheck className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Medical Command Center</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Doctor <span className="text-primary italic">Schedules</span></h1>
          <p className="text-sm text-muted-foreground font-medium">Manage patient flow and consultation windows across your medical practice.</p>
        </div>

        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl border">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "px-4 py-2 text-xs font-extrabold rounded-xl transition-all duration-300",
                selectedDay === day 
                  ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              )}
            >
              {day.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Actions Module (Left) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Create Slot
                </h3>
                <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
              </div>

              {!isVerified && (
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <p className="text-xs font-bold text-destructive">Verification required to add new slots.</p>
                </div>
              )}

              <form onSubmit={handleAddSchedule} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Consultation Day</label>
                  <div className="w-full px-4 py-3 bg-muted/30 border rounded-2xl text-sm font-bold text-foreground">
                    {selectedDay}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Assigned Start Time</label>
                  <div className="relative group">
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full h-12 px-4 bg-background border rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      disabled={!isVerified}
                    >
                      <option value="">Select available slot...</option>
                      {TIME_SLOTS.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedTime || !isVerified}
                  className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 shadow-xl shadow-primary/10"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Deploy Slot"}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex items-center gap-4">
             <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <LayoutGrid className="h-5 w-5" />
             </div>
             <div>
                <div className="text-xs font-black text-primary uppercase tracking-widest">Global Stats</div>
                <div className="text-lg font-black">{stats.weeklyTotal} Total Weekly Slots</div>
             </div>
          </div>
        </div>

        {/* Schedule Module (Right) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-2">
             <h2 className="text-xl font-black flex items-center gap-2 underline decoration-primary decoration-4 underline-offset-8">
                {selectedDay}
             </h2>
             <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Active Roster</span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSchedules.length > 0 ? (
              activeSchedules.map((slot) => (
                <div 
                  key={slot._id}
                  className="bg-card border rounded-3xl p-5 hover:border-primary/40 transition-all duration-300 group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex flex-col items-center justify-center border group-hover:bg-primary/5 transition-colors">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-lg font-black tracking-tight">{slot.startTime}</div>
                      <div className="text-[10px] font-extrabold text-muted-foreground uppercase">{slot.slotCount} Possible patients</div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleAvailability(slot._id, slot.isAvailable)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      slot.isAvailable 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white" 
                        : "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white"
                    )}
                  >
                    {slot.isAvailable ? "Available" : "Internal"}
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-16 text-center bg-muted/10 rounded-[2rem] border-2 border-dashed border-border/50">
                <Calendar className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                <h4 className="text-sm font-black text-muted-foreground/60 uppercase tracking-widest">No deployed slots for {selectedDay}</h4>
                <p className="text-xs text-muted-foreground font-medium mt-1">Use the control panel to initialize availability.</p>
              </div>
            )}
          </div>

          {activeSchedules.length > 0 && (
             <div className="pt-4 flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-2xl border border-dashed border-border">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <p className="text-[10px] font-bold text-muted-foreground leading-relaxed italic">
                   Note: Each slot is fixed at a 2-hour duration as per practice guidelines. End times are automatically calculated based on deployment window.
                </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorScheduleCreate;
