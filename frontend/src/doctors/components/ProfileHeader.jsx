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
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 gap-1.5 px-3 py-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </Badge>
        );
      case "pending":
      case "submitted":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 gap-1.5 px-3 py-1 font-medium">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20 gap-1.5 px-3 py-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1.5 px-3 py-1 text-muted-foreground font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> Unverified
          </Badge>
        );
    }
  };

  const isUnverified = status === "not_submitted";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/2 dark:from-primary/10 dark:to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between backdrop-blur-[2px]">
        <div className="flex flex-col items-center sm:flex-row gap-6 text-center sm:text-left">
          <Avatar className="h-28 w-28 border-4 border-background shadow-xl ring-1 ring-primary/20 transition-transform duration-500 hover:scale-105">
            <AvatarImage src={profile?.user?.photo} alt={name} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text">
                {name}
              </h1>
              {getStatusBadge()}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/5 text-primary text-sm font-semibold border border-primary/10">
                {specialty}
              </span>
              <span className="hidden sm:block text-muted-foreground/30">•</span>
              <span className="text-sm font-medium italic">Medical Professional</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={onToggleEdit}
            variant={isEditing ? "outline" : "default"}
            disabled={isUnverified && !isEditing}
            title={isUnverified ? "Submit verification details to unlock profile editing" : ""}
            className={`
              relative group overflow-hidden px-8 py-6 rounded-xl transition-all duration-300 active:scale-95
              ${!isEditing ? "shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)]" : ""}
            `}
          >
            <div className="relative z-10 flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
              <Edit2 className={`w-4 h-4 transition-transform duration-300 group-hover:rotate-12 ${isEditing ? "text-primary" : ""}`} />
              {isEditing ? "View Profile" : "Edit Profile"}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
