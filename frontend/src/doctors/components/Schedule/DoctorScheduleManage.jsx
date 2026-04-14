import React, { useEffect, useState, useMemo } from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Edit2,
  Settings2,
  AlertCircle
} from "lucide-react";
import { useDoctorSchedule } from "@/hooks/useDoctorSchedule";
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

const DoctorScheduleManage = () => {
  const { 
    schedules, 
    loading, 
    fetchSchedules, 
    toggleAvailability,
    editSchedule
  } = useDoctorSchedule();

  const [editingSlot, setEditingSlot] = useState(null);
  const [editFormData, setEditFormData] = useState({
      day: "",
      startTime: ""
  });

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const groupedSchedules = useMemo(() => {
    return DAYS.reduce((acc, day) => {
      acc[day] = schedules.filter(s => s.day === day).sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });
      return acc;
    }, {});
  }, [schedules]);

  const handleEditClick = (slot) => {
      setEditingSlot(slot._id);
      setEditFormData({
          day: slot.day,
          startTime: slot.startTime
      });
  };

  const handleUpdate = async (e) => {
      e.preventDefault();
      const success = await editSchedule(editingSlot, editFormData);
      if (success) {
          setEditingSlot(null);
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex items-center justify-between border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Active Schedule Management</h1>
          <p className="text-sm text-muted-foreground">Monitor and update your consultation windows.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border rounded-xl">
            <Settings2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Live Inventory</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading && schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-[2rem] gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Authenticating Schedule Inventory...</p>
          </div>
        ) : (
          DAYS.map((day) => (
            <div key={day} className="bg-card border rounded-[2rem] overflow-hidden shadow-sm transition-all hover:shadow-md">
              <div className="px-8 py-4 bg-muted/20 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-primary rounded-full" />
                  <h3 className="text-lg font-bold">{day}</h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-background border px-3 py-1 rounded-full">
                  {groupedSchedules[day].length} Managed Slots
                </span>
              </div>

              <div className="p-6">
                {groupedSchedules[day].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedSchedules[day].map((slot) => (
                      <div 
                        key={slot._id}
                        className={cn(
                          "relative group rounded-3xl border p-5 transition-all duration-300",
                          editingSlot === slot._id ? "border-primary bg-primary/5 ring-4 ring-primary/5" : "bg-background hover:border-primary/30"
                        )}
                      >
                        {editingSlot === slot._id ? (
                          /* Edit Form */
                          <form onSubmit={handleUpdate} className="space-y-4 animate-in zoom-in-95 duration-200">
                              <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Update Day</label>
                                  <select 
                                    value={editFormData.day}
                                    onChange={(e) => setEditFormData({...editFormData, day: e.target.value})}
                                    className="w-full text-xs font-bold bg-background border rounded-xl p-2 outline-none focus:ring-1 focus:ring-primary"
                                  >
                                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                  </select>
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Update Time</label>
                                  <select 
                                    value={editFormData.startTime}
                                    onChange={(e) => setEditFormData({...editFormData, startTime: e.target.value})}
                                    className="w-full text-xs font-bold bg-background border rounded-xl p-2 outline-none focus:ring-1 focus:ring-primary"
                                  >
                                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                  </select>
                              </div>
                              <div className="flex gap-2">
                                  <button type="submit" className="flex-1 bg-primary text-primary-foreground text-[10px] font-black uppercase py-2 rounded-lg hover:opacity-90">Save</button>
                                  <button type="button" onClick={() => setEditingSlot(null)} className="flex-1 bg-muted text-[10px] font-black uppercase py-2 rounded-lg hover:bg-muted/80">Cancel</button>
                              </div>
                          </form>
                        ) : (
                          /* Display View */
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-muted/50 flex items-center justify-center text-primary border">
                                  <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="text-lg font-black tracking-tight">{slot.startTime}</div>
                                  <div className="text-[9px] font-bold text-muted-foreground uppercase">{slot.slotCount} Possible patients</div>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleEditClick(slot)}
                                className="p-2 text-muted-foreground hover:text-primary transition-colors bg-muted/20 rounded-xl"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border",
                                slot.isAvailable ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                              )}>
                                {slot.isAvailable ? "Active Online" : "Paused / Offline"}
                              </span>
                              
                              <button
                                onClick={() => toggleAvailability(slot._id, slot.isAvailable)}
                                className={cn(
                                  "text-[10px] font-extrabold transition-all underline underline-offset-4",
                                  slot.isAvailable ? "text-rose-600 hover:text-rose-700" : "text-emerald-600 hover:text-emerald-700"
                                )}
                              >
                                {slot.isAvailable ? "Go Offline" : "Go Online"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 rounded-2xl bg-muted/5 border border-dashed border-border/50">
                    <Calendar className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-xs font-bold text-muted-foreground italic">No schedules defined for this day.</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

       {/* Quick Legend/Tip */}
       <div className="flex items-center gap-3 px-6 py-4 bg-primary/5 rounded-3xl border border-dashed border-primary/20">
          <AlertCircle className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
            <span className="text-primary uppercase tracking-widest">Enterprise Feature:</span> You can update the day and start time of any slot directly. End times are automatically re-calculated to maintain the required 2-hour consultation window.
          </p>
       </div>
    </div>
  );
};

export default DoctorScheduleManage;
