import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileDetailsView } from "../components/ProfileDetailsView";
import { ProfileEditForm } from "../components/ProfileEditForm";
import { VerificationBanner } from "../components/VerificationBanner";
import { VerificationForm } from "../components/VerificationForm";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCcw, ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DoctorProfile() {
  const {
    profile,
    loading,
    error,
    saving,
    isVerifying,
    isEditing,
    toggleEdit,
    updateProfile,
    submitVerification,
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

  const isUnverified = profile?.verification?.status === "not_submitted";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground/60 font-medium px-1">
        <Home className="w-3.5 h-3.5" />
        <ChevronRight className="w-4 h-4 opacity-30" />
        <span>Dashboard</span>
        <ChevronRight className="w-4 h-4 opacity-30" />
        <span className="text-muted-foreground/40">Doctor Profile</span>
        {profile?.user?.name && (
          <>
            <ChevronRight className="w-4 h-4 opacity-30" />
            <span className="text-primary/70 font-semibold">{profile.user.name.startsWith("Dr.") ? profile.user.name : `Dr. ${profile.user.name}`}</span>
          </>
        )}
      </nav>

      {isUnverified && <VerificationBanner />}

      <ProfileHeader
        profile={profile}
        isEditing={isEditing}
        onToggleEdit={toggleEdit}
      />

      {isUnverified ? (
        <div className="max-w-2xl mx-auto py-4">
          <VerificationForm onSubmit={submitVerification} loading={isVerifying} />
        </div>
      ) : isEditing ? (
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
