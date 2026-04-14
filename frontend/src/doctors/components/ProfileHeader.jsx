import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit2, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export function ProfileHeader({ profile, isEditing, onToggleEdit }) {
  const name = profile?.user?.name || "Doctor";
  const specialty = profile?.specialty || "General Physician";
  const status = profile?.verification?.status || "not_submitted";

  const getStatusBadge = () => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 gap-1.5 px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </Badge>
        );
      case "pending":
      case "submitted":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20 gap-1.5 px-3 py-1">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 gap-1.5 px-3 py-1">
            <AlertCircle className="w-3.5 h-3.5" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1.5 px-3 py-1 text-muted-foreground">
            <AlertCircle className="w-3.5 h-3.5" /> Unverified
          </Badge>
        );
    }
  };

  const isUnverified = status === "not_submitted";

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-card p-6 shadow-xs border-white/5 bg-linear-to-b from-white/[0.03] to-transparent backdrop-blur-sm">
      <div className="flex items-center gap-5">
        <Avatar className="h-20 w-20 border-2 border-primary/20 ring-4 ring-primary/5">
          <AvatarImage src={profile?.user?.photo} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
            {getStatusBadge()}
          </div>
          <p className="text-muted-foreground font-medium">{specialty}</p>
        </div>
      </div>

      <Button
        onClick={onToggleEdit}
        variant={isEditing ? "outline" : "default"}
        disabled={isUnverified && !isEditing}
        title={isUnverified ? "Submit verification details to unlock profile editing" : ""}
        className="gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Edit2 className="w-4 h-4" />
        {isEditing ? "View Profile" : "Edit Profile"}
      </Button>
    </div>
  );
}
