import { useEffect, useMemo, useState } from "react";
import { FileText, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getSharedWithMePatientReports } from "@/api/services/patientReportService";
import PatientReportCardSkeleton from "@/patients/components/PatientReportCardSkeleton";

function normalizeReportsResponse(response) {
  const data = response?.data;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.reports)) return data.reports;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

function formatDate(dt) {
  if (!dt) return "-";
  try {
    return new Date(dt).toLocaleString();
  } catch (e) {
    return String(dt);
  }
}

function isImageReport(report) {
  const mime = String(report?.mimeType || "").toLowerCase();
  if (mime.startsWith("image/")) return true;
  const url = String(report?.cloudinaryUrl || "").toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(url);
}

function isPdfReport(report) {
  const mime = String(report?.mimeType || "").toLowerCase();
  if (mime.includes("pdf")) return true;
  const url = String(report?.cloudinaryUrl || "").toLowerCase();
  return url.endsWith(".pdf");
}

function getFirstPagePreviewUrl(report) {
  const originalUrl = String(report?.cloudinaryUrl || "");
  if (!originalUrl) return "";

  if (!isPdfReport(report)) return originalUrl;

  const marker = "/upload/";
  const idx = originalUrl.indexOf(marker);
  if (idx === -1) return originalUrl;

  const prefix = originalUrl.slice(0, idx + marker.length);
  const suffix = originalUrl.slice(idx + marker.length);

  // Cloudinary-style transformation to render first page as an image thumbnail
  return `${prefix}pg_1,f_auto,q_auto/${suffix}`;
}

export default function DoctorPatientReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasReports = useMemo(() => reports.length > 0, [reports.length]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSharedWithMePatientReports();
      const list = normalizeReportsResponse(response);
      setReports(list);
    } catch (err) {
      console.error("Failed to load shared reports", err);
      setError(err);
      toast.error(err?.message || "Failed to load reports shared with you");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Patient Reports
        </h1>
        <p className="text-sm text-muted-foreground">
          Access and review reports that your patients have shared with you.
        </p>
      </div>

      <Separator />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">Shared with you</CardTitle>
            <p className="text-xs text-muted-foreground">
              These reports were explicitly shared with your doctor account.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={loadReports}
            disabled={loading}
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            {loading ? "Refreshing" : "Refresh"}
          </Button>
        </CardHeader>

        <CardContent>
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
              No reports have been shared with you yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {reports.map((report) => {
                const patientLabel =
                  report.patientName ||
                  report.patient?.name ||
                  report.user?.name ||
                  "Patient";

                return (
                  <div
                    key={report._id || report.id}
                    className="flex h-full flex-col justify-between rounded-xl border border-border/70 bg-card"
                  >
                    {report?.cloudinaryUrl && (
                      <div className="relative w-full overflow-hidden rounded-t-xl bg-muted">
                        {isImageReport(report) ? (
                          <img
                            src={report.cloudinaryUrl}
                            alt={report.title || "Report preview"}
                            className="h-48 w-full object-cover"
                          />
                        ) : isPdfReport(report) ? (
                          <img
                            src={getFirstPagePreviewUrl(report)}
                            alt={report.title || "Report preview"}
                            className="h-48 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
                            No inline preview available for this file type.
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-1 flex-col justify-between p-3">
                      <div className="space-y-1">
                        <p className="truncate text-sm font-semibold">
                          {report.title || "Untitled report"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {patientLabel} • {formatDate(report.createdAt)}
                        </p>
                      </div>

                      {report.description && (
                        <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-[0.78rem] text-muted-foreground">
                          {report.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
