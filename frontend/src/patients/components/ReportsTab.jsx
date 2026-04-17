import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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
import {
  deletePatientReport,
  getReportsForAppointment,
  updatePatientReport,
  uploadPatientReport,
} from "@/api/services/patientReportService";
import { getAppointment } from "@/api/services/appointmentService";

function normalizeReportsResponse(response) {
  const data = response?.data;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.reports)) return data.reports;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

export default function ReportsTab() {
  const { id: appointmentId } = useParams();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointment, setAppointment] = useState(null);

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

  useEffect(() => {
    if (!appointmentId) {
      setLoading(false);
      setError(new Error("Missing appointment id"));
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getReportsForAppointment(appointmentId);
        const list = normalizeReportsResponse(response);
        if (mounted) setReports(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load reports for appointment", err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [appointmentId]);

  useEffect(() => {
    if (!appointmentId) return;
    let mounted = true;

    const loadAppointment = async () => {
      try {
        const res = await getAppointment(appointmentId);
        const appt = res?.data?.appointment ?? res?.data ?? null;
        if (mounted) setAppointment(appt);
      } catch (err) {
        if (mounted) setAppointment(null);
      }
    };

    loadAppointment();
    return () => {
      mounted = false;
    };
  }, [appointmentId]);

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
      if (appointmentId) {
        formData.append("appointmentId", appointmentId);
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
        const refresh = await getReportsForAppointment(appointmentId);
        const list = normalizeReportsResponse(refresh);
        setReports(Array.isArray(list) ? list : []);
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
        dialogTitle="Add an appointment report"
      />

      <div className="space-y-4">
        {appointment?.status !== "completed" && (
          <div>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FilePlus className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Add Reports</p>
                <p className="text-sm text-muted-foreground">
                  Upload reports related to this appointment for your doctor to
                  review.
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
        )}

        <Separator />

        <div>
          <CardHeader className="px-0 pb-3">
            <CardTitle className="text-base">Appointment Reports</CardTitle>
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
                No reports added for this appointment yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {reports.map((report) => (
                  <PatientReportCard
                    key={report._id}
                    report={report}
                    onEdit={openEdit}
                    onDelete={setPendingDelete}
                    isDeleting={String(deletingId) === String(report._id)}
                    allowEditDelete={appointment?.status !== "completed"}
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
    </>
  );
}
