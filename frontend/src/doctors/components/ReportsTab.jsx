import { useEffect, useMemo, useState } from "react";
import { ExternalLink, FileText, Loader2, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReportsForAppointment } from "@/api/services/patientReportService";

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
  } catch (error) {
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

  return `${prefix}pg_1,f_auto,q_auto/${suffix}`;
}

export default function ReportsTab({ appointmentId }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasReports = useMemo(() => reports.length > 0, [reports.length]);

  const loadReports = async () => {
    if (!appointmentId) {
      setReports([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getReportsForAppointment(appointmentId);
      const list = normalizeReportsResponse(response);
      setReports(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Failed to load reports for this appointment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  if (!appointmentId) {
    return (
      <div className="text-sm text-muted-foreground">
        Missing appointment id.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base">Appointment Reports</CardTitle>
          <p className="text-xs text-muted-foreground">
            Reports submitted by the patient for this appointment.
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
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading reports...
          </div>
        ) : !hasReports ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            <FileText className="mb-2 h-7 w-7 opacity-30" />
            No reports submitted for this appointment yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {reports.map((report) => (
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
                      {formatDate(report.createdAt)}
                    </p>
                  </div>

                  {report.description && (
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-[0.78rem] text-muted-foreground">
                      {report.description}
                    </p>
                  )}

                  {report?.cloudinaryUrl && (
                    <div className="mt-3">
                      <Button asChild variant="outline" size="sm" className="gap-1">
                        <a href={report.cloudinaryUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
