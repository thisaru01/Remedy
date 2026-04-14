import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function UploadReportDialog({
  open,
  onOpenChange,
  uploading,
  uploadTitle,
  uploadDescription,
  uploadError,
  onTitleChange,
  onDescriptionChange,
  onFileChange,
  onSubmit,
  dialogTitle = "Add a general report",
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
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
              onChange={(e) => onTitleChange(e.target.value)}
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
              onChange={(e) => onDescriptionChange(e.target.value)}
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
                onFileChange(file);
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
              onClick={() => onOpenChange(false)}
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
  );
}

export default UploadReportDialog;
