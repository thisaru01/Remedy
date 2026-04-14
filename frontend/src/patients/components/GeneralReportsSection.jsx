import { useEffect, useMemo, useState } from "react";
import { FilePlus, FileText } from "lucide-react";
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
import UploadReportDialog from "@/patients/components/UploadReportDialog";
import EditReportDialog from "@/patients/components/EditReportDialog";
import PatientReportCard from "@/patients/components/PatientReportCard";
import PatientReportCardSkeleton from "@/patients/components/PatientReportCardSkeleton";
import ShareReportDialog from "@/patients/components/ShareReportDialog";
import {
  deletePatientReport,
  getMyPatientReports,
  updatePatientReport,
  uploadPatientReport,
} from "@/api/services/patientReportService";

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

  const hasReports = useMemo(() => reports.length > 0, [reports.length]);

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
      <UploadReportDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        uploading={uploading}
        uploadTitle={uploadTitle}
        uploadDescription={uploadDescription}
        uploadError={uploadError}
        onTitleChange={setUploadTitle}
        onDescriptionChange={setUploadDescription}
        onFileChange={setUploadFile}
        onSubmit={handleUpload}
      />

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
      <EditReportDialog
        open={Boolean(editingReport)}
        report={editingReport}
        updating={updating}
        updateError={updateError}
        onClose={() => setEditingReport(null)}
        onSubmit={handleUpdate}
      />

      <ShareReportDialog
        open={Boolean(sharingReport)}
        report={sharingReport}
        onClose={() => setSharingReport(null)}
        onReportUpdated={(updated) => {
          setReports((prev) =>
            prev.map((r) =>
              String(r._id) === String(updated._id) ? updated : r,
            ),
          );
          // Keep dialog's current report in sync if it's the same one
          setSharingReport((prev) =>
            prev && String(prev._id) === String(updated._id) ? updated : prev,
          );
        }}
      />
    </>
  );
}
