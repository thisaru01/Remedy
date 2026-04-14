import { MapPin, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/context/auth/useAuth";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * Public-facing doctor directory card used on the Book Appointments page.
 * @param {{ doctor: object }} props
 */
export default function DoctorCard({ doctor }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const name = doctor?.doctorName || doctor?.user?.name || "Doctor";
  const photo = doctor?.profilePhoto || doctor?.user?.profilePhoto || "";
  const specialty = doctor?.specialty || "General Physician";
  const bio = doctor?.bio || "";
  const languages = Array.isArray(doctor?.languages)
    ? doctor.languages.slice(0, 3)
    : [];
  const location = useMemo(() => {
    if (!Array.isArray(doctor?.workingHospitals)) return "";
    const first = doctor.workingHospitals[0];
    if (!first) return "";
    const parts = [first.hospitalName, first.city, first.country].filter(
      Boolean,
    );
    return parts.join(", ");
  }, [doctor?.workingHospitals]);

  const initials = getInitials(name);

  function handleBookClick() {
    if (!isAuthenticated) {
      navigate("/auth?redirect=/book-appointments");
      return;
    }

    // TODO: Wire this up to a dedicated booking flow (schedule selection + POST /appointments)
    navigate("");
  }

  return (
    <Card className="flex flex-col gap-0 overflow-hidden border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0 text-base">
            <AvatarImage src={photo} alt={name} />
            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
              {initials || "D"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Stethoscope className="h-3.5 w-3.5" />
              <span className="truncate">{specialty}</span>
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="border-dashed text-[11px]">
            Approved doctor
          </Badge>

          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate max-w-40">{location}</span>
            </span>
          )}
        </div>

        {/* Bio */}
        {bio && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {bio}
          </p>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
            {languages.map((lang) => (
              <span
                key={lang}
                className="rounded-md border border-border bg-muted px-2 py-0.5"
              >
                {lang}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto flex flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end">
        <Button className="w-full sm:w-auto" onClick={handleBookClick}>
          Book Appointment
        </Button>
      </CardFooter>
    </Card>
  );
}
