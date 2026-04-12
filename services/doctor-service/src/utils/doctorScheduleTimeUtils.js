export const DOCTOR_SCHEDULE_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const FIXED_SCHEDULE_PERIOD_HOURS = 2;

export const parse12HourTimeToMinutes = (timeStr) => {
  if (typeof timeStr !== "string") {
    return null;
  }

  const match = timeStr.trim().match(/^(\d{1,2})\s*[:.]\s*(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  const hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  const amPm = match[3].toUpperCase();

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return null;
  }

  let normalizedHour = hour % 12;
  if (amPm === "PM") {
    normalizedHour += 12;
  }

  return normalizedHour * 60 + minute;
};

export const formatMinutesTo12HourTime = (totalMinutes) => {
  const minutesInDay = 24 * 60;
  const normalized = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay;

  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const amPm = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${hour12}:${String(minute).padStart(2, "0")} ${amPm}`;
};

export const calculateScheduleEndTime = (
  startTime,
  periodHours = FIXED_SCHEDULE_PERIOD_HOURS,
) => {
  const startMinutes = parse12HourTimeToMinutes(startTime);
  if (startMinutes === null) {
    return null;
  }

  const periodMinutes = periodHours * 60;
  return formatMinutesTo12HourTime(startMinutes + periodMinutes);
};
