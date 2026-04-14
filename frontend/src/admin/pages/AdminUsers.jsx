import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAdminVerifications } from "@/hooks/useAdminVerifications";
import { DoctorVerificationTable } from "../components/DoctorVerificationTable";
import { VerificationReviewModal } from "../components/VerificationReviewModal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  ShieldCheck, 
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";

const allowedTypes = new Set(["doctor", "patient"]);

export default function AdminUsers() {
  const { type } = useParams();
  const normalizedType = (type ?? "doctor").toLowerCase();
  const safeType = allowedTypes.has(normalizedType) ? normalizedType : "doctor";

  const {
    doctors,
    status,
    setStatus,
    loading,
    actionLoading,
    approveDoctor,
    rejectDoctor,
  } = useAdminVerifications("submitted");

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const handleReview = (doctor) => {
    setSelectedDoctor(doctor);
    setReviewModalOpen(true);
  };

  const handleApprove = async (id) => {
    const res = await approveDoctor(id);
    if (res.success) setReviewModalOpen(false);
  };

  const handleReject = async (id) => {
    const res = await rejectDoctor(id);
    if (res.success) setReviewModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" /> User Management
          </h1>
          <p className="text-muted-foreground">
            Manage, verify, and monitor platform users across all roles.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Tabs value={safeType} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="doctor" asChild>
              <a href="/admin/users/doctor" className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Doctors
              </a>
            </TabsTrigger>
            <TabsTrigger value="patient" asChild>
              <a href="/admin/users/patient" className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Patients
              </a>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {safeType === "doctor" ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-muted/20 p-4 rounded-xl border">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search doctors by ID or specialty..." className="pl-9 h-9" />
                </div>
                <Tabs value={status} onValueChange={setStatus} className="h-9">
                  <TabsList className="h-9 bg-background border">
                    <TabsTrigger value="submitted" className="h-7 text-xs">Pending</TabsTrigger>
                    <TabsTrigger value="approved" className="h-7 text-xs">Approved</TabsTrigger>
                    <TabsTrigger value="rejected" className="h-7 text-xs">Rejected</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <DoctorVerificationTable
              doctors={doctors}
              loading={loading}
              onReview={handleReview}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 text-center rounded-2xl border bg-muted/10 italic text-muted-foreground">
            Patient management UI coming soon...
          </div>
        )}
      </div>

      <VerificationReviewModal
        doctor={selectedDoctor}
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={!!actionLoading}
      />
    </div>
  );
}