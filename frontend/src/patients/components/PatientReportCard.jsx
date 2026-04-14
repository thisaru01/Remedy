import { FileText, Pencil, Trash2, ExternalLink } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export default function PatientReportCard({
  report,
  onEdit,
  onDelete,
  isDeleting,
}) {
  const isLinkedToAppointment = Boolean(report?.appointmentId);

  return (
    <Card className="flex h-full flex-col justify-between border border-border/70 bg-card">
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
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-1 overflow-hidden">
            <CardTitle className="truncate text-sm font-semibold">
              {report?.title || "Untitled report"}
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              {formatDate(report?.createdAt)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-2 text-xs text-muted-foreground">
        {report?.description ? (
          <p className="line-clamp-3 whitespace-pre-wrap break-words text-[0.78rem] leading-snug">
            {report.description}
          </p>
        ) : (
          <p className="text-[0.78rem] italic">No description provided.</p>
        )}

        {isLinkedToAppointment && (
          <div className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[0.68rem] font-medium text-sky-700">
            Linked to appointment
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between gap-2 border-t bg-muted/40 py-2">
        <div className="flex items-center gap-1.5">
          {report?.cloudinaryUrl && (
            <Button
              asChild
              variant="outline"
              size="xs"
              className="h-7 gap-1 px-2 text-[0.75rem]"
            >
              <a href={report.cloudinaryUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Open in new tab
              </a>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-xs"
            type="button"
            onClick={() => onEdit?.(report)}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="destructive"
            size="icon-xs"
            type="button"
            disabled={isDeleting}
            onClick={() => onDelete?.(report)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
