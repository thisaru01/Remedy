import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ProfileHeader({ profile, isEditing, onToggleEdit }) {
  const rawName = profile?.user?.name || "Doctor";
  const name =
    rawName !== "Doctor" && !rawName.startsWith("Dr.")
      ? `Dr. ${rawName}`
      : rawName;
  const specialty = profile?.specialty || "General Physician";
  const status = profile?.verification?.status || "not_submitted";

  const getStatusBadge = () => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 gap-1.5 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </Badge>
        );
      case "pending":
      case "submitted":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 gap-1.5 font-medium">
            <Clock className="w-3 h-3" /> Under Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 gap-1.5 font-medium">
            <AlertCircle className="w-3 h-3" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1.5 text-muted-foreground font-medium">
            <AlertCircle className="w-3 h-3" /> Unverified
          </Badge>
        );
    }
  };

  const isUnverified = status === "not_submitted";

  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardContent className="p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start justify-between">
          <div className="flex flex-col items-center sm:flex-row gap-6 text-center sm:text-left">
            <Avatar className="h-24 w-24 border shadow-sm transition-transform duration-300">
              <AvatarImage src={profile?.user?.photo} alt={name} className="object-cover" />
              <AvatarFallback className="bg-muted text-muted-foreground text-3xl font-semibold">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {name}
                </h1>
                <div className="pt-1">{getStatusBadge()}</div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 text-muted-foreground">
                <span className="font-medium text-foreground">
                  {specialty}
                </span>
                <span className="hidden sm:block text-muted-foreground/50">•</span>
                <span className="text-sm">Medical Professional</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={onToggleEdit}
              variant={isEditing ? "outline" : "default"}
              disabled={isUnverified && !isEditing}
              title={isUnverified ? "Submit verification details to unlock profile editing" : ""}
              className="gap-2"
            >
              <Edit2 className="w-4 h-4" />
              {isEditing ? "View Profile" : "Edit Profile"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
