import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  grantDoctorAccessToPatientReport,
  revokeDoctorAccessToPatientReport,
} from "@/api/services/patientReportService";
import {
  getApprovedDoctors,
  getDoctorDetails,
} from "@/api/services/doctorService";

/**
 * Dialog for sharing a report with doctors and revoking access.
 *
 * Props:
 * - open: boolean
 * - report: the report being shared (or null)
 * - onClose: () => void
 * - onReportUpdated: (updatedReport) => void
 */
export default function ShareReportDialog({
  open,
  report,
  onClose,
  onReportUpdated,
}) {
  const [shareDoctorId, setShareDoctorId] = useState("");
  const [shareExpiresAt, setShareExpiresAt] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState(null);

  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [doctorError, setDoctorError] = useState(null);
  const [doctorsLoaded, setDoctorsLoaded] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [revokingDoctorId, setRevokingDoctorId] = useState(null);

  // Reset local state when dialog opens/closes or report changes
  useEffect(() => {
    if (!open) {
      setShareDoctorId("");
      setShareExpiresAt("");
      setShareError(null);
      setDoctorSearch("");
      setSelectedDoctor(null);
      setRevokingDoctorId(null);
      return;
    }

    // When opening for a new report, keep any loaded doctors but reset selection
    setShareDoctorId("");
    setShareExpiresAt("");
    setShareError(null);
    setDoctorSearch("");
    setSelectedDoctor(null);
    setRevokingDoctorId(null);
  }, [open, report]);

  // Load approved doctors lazily when dialog opens the first time
  useEffect(() => {
    if (!open || doctorsLoaded) return;

    let cancelled = false;

    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        setDoctorError(null);
        const response = await getApprovedDoctors();
        const raw = response?.data?.profiles ?? response?.data ?? [];
        let list = Array.isArray(raw) ? raw : [];

        // Enrich doctor profiles with display name/photo where possible
        try {
          const enriched = await Promise.all(
            list.map(async (doctor) => {
              const userId =
                doctor.userId || doctor.user?._id || doctor._id || null;
              if (!userId) return doctor;

              try {
                const detailResp = await getDoctorDetails(userId);
                const detail =
                  detailResp?.data?.profile || detailResp?.data?.data;
                if (!detail) return doctor;

                return {
                  ...doctor,
                  doctorName:
                    detail.doctorName || detail.user?.name || doctor.doctorName,
                  profilePhoto:
                    detail.profilePhoto ||
                    detail.user?.profilePhoto ||
                    doctor.profilePhoto,
                };
              } catch {
                return doctor;
              }
            }),
          );
          list = enriched;
        } catch {
          // If enrichment fails, fall back to raw list
        }

        if (!cancelled) {
          setDoctorOptions(list);
          setDoctorsLoaded(true);
        }
      } catch (err) {
        if (!cancelled) {
          setDoctorError(err);
          setDoctorOptions([]);
          toast.error(
            err?.message || "Failed to load doctors. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingDoctors(false);
        }
      }
    };

    loadDoctors();

    return () => {
      cancelled = true;
    };
  }, [open, doctorsLoaded]);

  const filteredDoctors = useMemo(() => {
    if (!Array.isArray(doctorOptions) || doctorOptions.length === 0) {
      return [];
    }

    const query = doctorSearch.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return doctorOptions
      .filter((doctor) => {
        const name = doctor?.doctorName || doctor?.user?.name || "";
        const specialty = doctor?.specialty || "";
        const bio = doctor?.bio || "";
        const languages = Array.isArray(doctor?.languages)
          ? doctor.languages.join(" ")
          : "";
        const hospitals = Array.isArray(doctor?.workingHospitals)
          ? doctor.workingHospitals.map((h) => h?.hospitalName || "").join(" ")
          : "";

        const haystack =
          `${name} ${specialty} ${bio} ${languages} ${hospitals}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 6);
  }, [doctorOptions, doctorSearch]);

  const sharedDoctors = useMemo(() => {
    if (!report || !Array.isArray(report.sharedWith)) {
      return [];
    }

    return report.sharedWith.map((share) => {
      const doctorId = String(share.doctorId);
      const profile = doctorOptions.find((d) => {
        const id = d.userId || d.user?._id || d._id;
        return id && String(id) === doctorId;
      });

      const name =
        profile?.doctorName ||
        profile?.user?.name ||
        `Doctor (${doctorId.slice(0, 6)}...)`;

      const expiresAt = share.expiresAt ? new Date(share.expiresAt) : null;
      const now = new Date();
      const isExpired = Boolean(expiresAt && expiresAt <= now);

      return {
        doctorId,
        name,
        grantedAt: share.grantedAt,
        expiresAt,
        isExpired,
      };
    });
  }, [report, doctorOptions]);

  const handleSelectDoctor = (doctor) => {
    if (!doctor) return;
    const id = doctor.userId || doctor.user?._id || doctor._id || "";
    setShareDoctorId(id ? String(id) : "");
    setSelectedDoctor(doctor);
  };

  const handleShare = async (event) => {
    event.preventDefault();
    if (!report?._id) return;

    const trimmedDoctorId = shareDoctorId.trim();
    if (!trimmedDoctorId) {
      setShareError("Doctor ID is required.");
      toast.error("Please select a doctor to share with.");
      return;
    }

    try {
      setSharing(true);
      setShareError(null);

      const body = { doctorId: trimmedDoctorId };
      if (shareExpiresAt.trim()) {
        body.expiresAt = shareExpiresAt.trim();
      }

      const response = await grantDoctorAccessToPatientReport(report._id, body);
      const updated = response?.data?.data || response?.data?.report || null;

      if (updated && onReportUpdated) {
        onReportUpdated(updated);
      }

      toast.success("Access granted to doctor");
      onClose?.();
    } catch (err) {
      console.error("Failed to grant access", err);
      setShareError(err?.message || "Failed to grant access");
      toast.error(err?.message || "Failed to grant access");
    } finally {
      setSharing(false);
    }
  };

  const handleRevokeDoctorAccess = async (doctorId) => {
    if (!report?._id || !doctorId) return;

    try {
      setRevokingDoctorId(doctorId);
      const response = await revokeDoctorAccessToPatientReport(
        report._id,
        doctorId,
      );
      const updated = response?.data?.data || response?.data?.report || null;

      if (updated && onReportUpdated) {
        onReportUpdated(updated);
      }

      toast.success("Access revoked for doctor");
    } catch (err) {
      console.error("Failed to revoke access", err);
      toast.error(err?.message || "Failed to revoke access");
    } finally {
      setRevokingDoctorId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share report with doctor</DialogTitle>
        </DialogHeader>
        {report && (
          <form onSubmit={handleShare} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="share-doctor-search"
                className="text-xs font-medium text-foreground"
              >
                Search doctor
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="share-doctor-search"
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  placeholder="Search by doctor name"
                  className="pl-7"
                />
              </div>
              <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-md border bg-muted/40 p-1 text-xs">
                {loadingDoctors && (
                  <p className="px-2 py-1 text-muted-foreground">
                    Loading doctors…
                  </p>
                )}
                {!loadingDoctors && doctorError && (
                  <p className="px-2 py-1 text-destructive">
                    {doctorError.message || "Failed to load doctors"}
                  </p>
                )}
                {!loadingDoctors &&
                  !doctorError &&
                  doctorSearch.trim() === "" && (
                    <p className="px-2 py-1 text-muted-foreground">
                      Start typing to search for a doctor.
                    </p>
                  )}
                {!loadingDoctors &&
                  !doctorError &&
                  doctorSearch.trim() !== "" &&
                  filteredDoctors.length === 0 && (
                    <p className="px-2 py-1 text-muted-foreground">
                      No doctors match your search.
                    </p>
                  )}
                {!loadingDoctors &&
                  !doctorError &&
                  filteredDoctors.map((doctor) => {
                    const name =
                      doctor.doctorName || doctor.user?.name || "Doctor";
                    const specialty = doctor.specialty || "";
                    const isActive =
                      selectedDoctor &&
                      (selectedDoctor.userId === doctor.userId ||
                        selectedDoctor._id === doctor._id);
                    return (
                      <button
                        key={doctor._id || doctor.userId}
                        type="button"
                        onClick={() => handleSelectDoctor(doctor)}
                        className={`flex w-full flex-col items-start rounded-md px-2 py-1 text-left hover:bg-background ${isActive ? "bg-background" : ""}`}
                      >
                        <span className="font-medium text-foreground">
                          {name}
                        </span>
                        {specialty && (
                          <span className="text-[0.7rem] text-muted-foreground">
                            {specialty}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
              {selectedDoctor && (
                <p className="text-[0.7rem] text-muted-foreground">
                  Selected doctor:{" "}
                  {selectedDoctor.doctorName || selectedDoctor.user?.name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="share-expires-at"
                className="text-xs font-medium text-foreground"
              >
                Expires at (optional)
              </label>
              <Input
                id="share-expires-at"
                name="expiresAt"
                value={shareExpiresAt}
                onChange={(e) => setShareExpiresAt(e.target.value)}
                placeholder="e.g. 2026-04-30T18:00:00Z"
              />
              <p className="text-[0.7rem] text-muted-foreground">
                Leave empty for no expiry, or provide an ISO date-time.
              </p>
            </div>

            {sharedDoctors.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">
                  Currently shared with
                </p>
                <div className="space-y-1 rounded-md border bg-muted/40 p-2 text-xs">
                  {sharedDoctors.map((entry) => (
                    <div
                      key={entry.doctorId}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {entry.name}
                        </p>
                        <p className="text-[0.7rem] text-muted-foreground">
                          {entry.isExpired
                            ? "Access expired"
                            : entry.expiresAt
                              ? `Expires at ${entry.expiresAt.toLocaleString()}`
                              : "No expiry"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        className="h-7 px-2 text-[0.7rem]"
                        disabled={revokingDoctorId === entry.doctorId}
                        onClick={() => handleRevokeDoctorAccess(entry.doctorId)}
                      >
                        {revokingDoctorId === entry.doctorId
                          ? "Revoking..."
                          : "Revoke"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {shareError && (
              <p className="text-xs text-destructive">{shareError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onClose?.()}
                disabled={sharing}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={sharing}>
                {sharing ? "Sharing..." : "Share"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
