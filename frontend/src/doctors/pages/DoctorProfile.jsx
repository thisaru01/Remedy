import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileDetailsView } from "../components/ProfileDetailsView";
import { ProfileEditForm } from "../components/ProfileEditForm";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DoctorProfile() {
  const {
    profile,
    loading,
    error,
    saving,
    isEditing,
    toggleEdit,
    updateProfile,
    refreshProfile,
  } = useDoctorProfile();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-60 w-full md:col-span-2" />
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 rounded-xl border border-destructive/20 bg-destructive/5">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Failed to load profile</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Button onClick={refreshProfile} variant="outline" className="gap-2">
          <RefreshCcw className="w-4 h-4" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Professional Profile</h1>
        <p className="text-muted-foreground">
          Manage your clinical background, expertise, and digital identity.
        </p>
      </div>

      <ProfileHeader
        profile={profile}
        isEditing={isEditing}
        onToggleEdit={toggleEdit}
      />

      {isEditing ? (
        <ProfileEditForm
          profile={profile}
          saving={saving}
          onSave={updateProfile}
          onCancel={toggleEdit}
        />
      ) : (
        <ProfileDetailsView profile={profile} />
      )}
    </div>
  );
}
