import React, { useEffect, useState, useMemo } from "react";
import { 
  Calendar, 
  Clock, 
  Loader2,
  Edit2,
  Settings2,
  AlertCircle,
  CalendarDays
} from "lucide-react";
import { useDoctorSchedule } from "@/hooks/useDoctorSchedule";
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

  if (hours === 12) hours = 0;
  if (ampm === "PM") hours += 12;

  hours += 2; // Fixed 2-hour duration

  let endAmpm = hours >= 12 && hours < 24 ? "PM" : "AM";
  let endHours = hours % 12;
  if (endHours === 0) endHours = 12;

  const paddedHours = endHours.toString().padStart(2, "0");
  return `${paddedHours}:${minutes} ${endAmpm}`;
};

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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-sm text-muted-foreground">Monitor and update your active consultation windows.</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5 w-fit">
            <Settings2 className="h-4 w-4 text-primary" />
            <span className="font-medium">Live Inventory</span>
        </Badge>
      </div>

      <div className="space-y-8">
        {loading && schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-lg gap-4 bg-muted/10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Loading Schedule Inventory...</p>
          </div>
        ) : (
          DAYS.map((day) => (
            <Card key={day} className="overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-muted/30 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">{day}</h3>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {groupedSchedules[day].length} Slots
                </Badge>
              </div>

              <CardContent className="p-6">
                {groupedSchedules[day].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedSchedules[day].map((slot) => {
                      const isEditing = editingSlot === slot._id;
                      const endTime = calculateEndTime(slot.startTime);

                      return (
                      <div 
                        key={slot._id}
                        className={cn(
                          "relative rounded-lg border p-4 transition-all duration-200",
                          isEditing ? "border-primary bg-primary/5 shadow-sm" : "bg-card hover:shadow-sm"
                        )}
                      >
                        {isEditing ? (
                          /* Edit Form */
                          <form onSubmit={handleUpdate} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                              <div className="space-y-1.5">
                                  <label className="text-xs font-medium text-muted-foreground">Update Day</label>
                                  <select 
                                    value={editFormData.day}
                                    onChange={(e) => setEditFormData({...editFormData, day: e.target.value})}
                                    className="w-full text-sm font-medium bg-background border rounded-md p-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                  >
                                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                  </select>
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-xs font-medium text-muted-foreground">Update Start Time</label>
                                  <select 
                                    value={editFormData.startTime}
                                    onChange={(e) => setEditFormData({...editFormData, startTime: e.target.value})}
                                    className="w-full text-sm font-medium bg-background border rounded-md p-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                  >
                                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                  </select>
                              </div>
                              <div className="flex gap-2 pt-2">
                                  <Button type="submit" size="sm" className="flex-1">Save</Button>
                                  <Button variant="outline" size="sm" type="button" onClick={() => setEditingSlot(null)} className="flex-1">Cancel</Button>
                              </div>
                          </form>
                        ) : (
                          /* Display View */
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-md bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                  <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="text-base font-semibold">{slot.startTime} - {endTime}</div>
                                  <div className="text-sm text-muted-foreground">{slot.slotCount} Capacity</div>
                                </div>
                              </div>
                              <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(slot)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                              <Badge 
                                variant={slot.isAvailable ? "default" : "secondary"} 
                                className={cn(
                                  "font-medium", 
                                  slot.isAvailable ? "bg-emerald-600 hover:bg-emerald-700" : ""
                                )}
                              >
                                {slot.isAvailable ? "Online" : "Offline"}
                              </Badge>
                              
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => toggleAvailability(slot._id, slot.isAvailable)}
                                className={cn(
                                  "h-auto p-0 font-medium",
                                  slot.isAvailable ? "text-rose-600 hover:text-rose-700" : "text-emerald-600 hover:text-emerald-700"
                                )}
                              >
                                {slot.isAvailable ? "Set Offline" : "Set Online"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )})}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 rounded-lg bg-muted/20 border border-dashed text-center">
                    <Calendar className="h-8 w-8 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium text-foreground">No slots scheduled.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

       {/* Quick Legend/Tip */}
       <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 text-blue-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">
             <strong>Schedule Editing Note:</strong> You can update the day and start time of an unbooked slot directly. End times are automatically re-calculated to match the established 2-hour window. Slots with active appointments cannot be modified or set to offline.
          </p>
       </div>
    </div>
  );
};

export default DoctorScheduleManage;
