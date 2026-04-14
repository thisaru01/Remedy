import { useEffect, useMemo, useState } from "react";
import { FilePlus, FileText, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PatientReportCard from "@/patients/components/PatientReportCard";
import PatientReportCardSkeleton from "@/patients/components/PatientReportCardSkeleton";
import {
  deletePatientReport,
  getMyPatientReports,
  updatePatientReport,
  uploadPatientReport,
  grantDoctorAccessToPatientReport,
} from "@/api/services/patientReportService";
import {
  getApprovedDoctors,
  getDoctorDetails,
} from "@/api/services/doctorService";

function normalizeReportsResponse(response) {
  const data = response?.data;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.reports)) return data.reports;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

export default function GeneralReportsSection() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const [editingReport, setEditingReport] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [sharingReport, setSharingReport] = useState(null);
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

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getMyPatientReports();
        const all = normalizeReportsResponse(response);
        const generalOnly = all.filter((r) => !r.appointmentId);
        if (mounted) setReports(generalOnly);
      } catch (err) {
        console.error("Failed to load reports", err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!sharingReport || doctorsLoaded) return;

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
  }, [sharingReport, doctorsLoaded]);

  const hasReports = useMemo(() => reports.length > 0, [reports.length]);

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

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!uploadFile) {
      setUploadError("Please choose a file to upload.");
      return;
    }

    const trimmedTitle = uploadTitle.trim();
    if (!trimmedTitle) {
      setUploadError("Title is required.");
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("report", uploadFile);
      formData.append("title", trimmedTitle);
      if (uploadDescription.trim()) {
        formData.append("description", uploadDescription.trim());
      }

      const response = await uploadPatientReport(formData);
      const createdList = normalizeReportsResponse(response);
      const created =
        Array.isArray(createdList) && createdList.length === 1
          ? createdList[0]
          : (response?.data?.data ?? response?.data?.report ?? null);

      const createdReport = created || createdList[0];
      if (createdReport) {
        setReports((prev) => [createdReport, ...prev]);
      } else {
        // fallback: refresh list
        const refresh = await getMyPatientReports();
        const all = normalizeReportsResponse(refresh).filter(
          (r) => !r.appointmentId,
        );
        setReports(all);
      }

      toast.success("Report uploaded successfully");
      setUploadOpen(false);
      setUploadTitle("");
      setUploadDescription("");
      setUploadFile(null);
    } catch (err) {
      console.error("Failed to upload report", err);
      setUploadError(err?.message || "Failed to upload report");
      toast.error(err?.message || "Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (report) => {
    setEditingReport(report || null);
    setUpdateError(null);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editingReport?._id) return;

    const title = (event.target.elements.title?.value || "").trim();
    const description = event.target.elements.description?.value || "";

    if (!title) {
      setUpdateError("Title is required.");
      return;
    }

    try {
      setUpdating(true);
      setUpdateError(null);
      const payload = { title, description };
      const response = await updatePatientReport(editingReport._id, payload);
      const updated = response?.data?.data || response?.data?.report || payload;

      setReports((prev) =>
        prev.map((r) =>
          String(r._id) === String(editingReport._id)
            ? { ...r, ...updated, title, description }
            : r,
        ),
      );

      toast.success("Report updated");
      setEditingReport(null);
    } catch (err) {
      console.error("Failed to update report", err);
      setUpdateError(err?.message || "Failed to update report");
      toast.error(err?.message || "Failed to update report");
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete?._id) return;
    try {
      setDeletingId(pendingDelete._id);
      await deletePatientReport(pendingDelete._id);
      setReports((prev) =>
        prev.filter((r) => String(r._id) !== String(pendingDelete._id)),
      );
      toast.success("Report deleted");
      setPendingDelete(null);
    } catch (err) {
      console.error("Failed to delete report", err);
      toast.error(err?.message || "Failed to delete report");
    } finally {
      setDeletingId(null);
    }
  };

  const openShare = (report) => {
    setSharingReport(report || null);
    setShareDoctorId("");
    setShareExpiresAt("");
    setShareError(null);
    setDoctorSearch("");
    setSelectedDoctor(null);
  };

  const handleShare = async (event) => {
    event.preventDefault();
    if (!sharingReport?._id) return;

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

      const response = await grantDoctorAccessToPatientReport(
        sharingReport._id,
        body,
      );
      const updated = response?.data?.data || response?.data?.report || null;

      if (updated) {
        setReports((prev) =>
          prev.map((r) =>
            String(r._id) === String(sharingReport._id) ? updated : r,
          ),
        );
      }

      toast.success("Access granted to doctor");
      setSharingReport(null);
    } catch (err) {
      console.error("Failed to grant access", err);
      setShareError(err?.message || "Failed to grant access");
      toast.error(err?.message || "Failed to grant access");
    } finally {
      setSharing(false);
    }
  };

  const handleSelectDoctor = (doctor) => {
    if (!doctor) return;
    const id = doctor.userId || doctor.user?._id || doctor._id || "";
    setShareDoctorId(id ? String(id) : "");
    setSelectedDoctor(doctor);
  };

  return (
    <>
      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The report will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deletingId)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
              disabled={Boolean(deletingId)}
            >
              {deletingId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a general report</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="report-title"
                className="text-xs font-medium text-foreground"
              >
                Title
              </label>
              <Input
                id="report-title"
                name="title"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. Blood test results"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="report-description"
                className="text-xs font-medium text-foreground"
              >
                Description (optional)
              </label>
              <Textarea
                id="report-description"
                name="description"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Add any notes about this report"
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="report-file"
                className="text-xs font-medium text-foreground"
              >
                File
              </label>
              <Input
                id="report-file"
                name="file"
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setUploadFile(file);
                }}
              />
              <p className="text-[0.7rem] text-muted-foreground">
                Upload PDF or image files. Max size depends on server limits.
              </p>
            </div>

            {uploadError && (
              <p className="text-xs text-destructive">{uploadError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUploadOpen(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {/* Banner and upload CTA */}
        <div>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <FilePlus className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Add Reports</p>
              <p className="text-sm text-muted-foreground">
                Upload general medical reports for easy access and sharing.
              </p>
            </div>
            <Button
              disabled={loading || uploading}
              className="gap-2"
              type="button"
              onClick={() => setUploadOpen(true)}
            >
              <FilePlus className="h-4 w-4" />
              {uploading ? "Uploading..." : "Add report"}
            </Button>
          </CardContent>
        </div>

        <Separator />

        {/* Reports list */}
        <div>
          <CardHeader className="px-0 pb-3">
            <CardTitle className="text-base">Reports</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {error && (
              <p className="mb-3 text-sm text-destructive">
                {error.message || "Failed to load reports"}
              </p>
            )}

            {loading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                <PatientReportCardSkeleton />
                <PatientReportCardSkeleton />
                <PatientReportCardSkeleton />
                <PatientReportCardSkeleton />
                <PatientReportCardSkeleton />
                <PatientReportCardSkeleton />
              </div>
            ) : !hasReports ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                <FileText className="mb-2 h-7 w-7 opacity-30" />
                No general reports added yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {reports.map((report) => (
                  <PatientReportCard
                    key={report._id}
                    report={report}
                    onEdit={openEdit}
                    onDelete={setPendingDelete}
                    onShare={openShare}
                    isDeleting={String(deletingId) === String(report._id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </div>
      </div>

      <Dialog
        open={Boolean(editingReport)}
        onOpenChange={(open) => {
          if (!open) setEditingReport(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit report</DialogTitle>
          </DialogHeader>
          {editingReport && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="edit-report-title"
                  className="text-xs font-medium text-foreground"
                >
                  Title
                </label>
                <Input
                  id="edit-report-title"
                  name="title"
                  defaultValue={editingReport.title}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edit-report-description"
                  className="text-xs font-medium text-foreground"
                >
                  Description (optional)
                </label>
                <Textarea
                  id="edit-report-description"
                  name="description"
                  defaultValue={editingReport.description}
                  rows={3}
                />
              </div>

              {updateError && (
                <p className="text-xs text-destructive">{updateError}</p>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingReport(null)}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={updating}>
                  {updating ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(sharingReport)}
        onOpenChange={(open) => {
          if (!open) setSharingReport(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share report with doctor</DialogTitle>
          </DialogHeader>
          {sharingReport && (
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

              {shareError && (
                <p className="text-xs text-destructive">{shareError}</p>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSharingReport(null)}
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
    </>
  );
}
