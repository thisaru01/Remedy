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

function EditReportDialog({
  open,
  report,
  updating,
  updateError,
  onClose,
  onSubmit,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit report</DialogTitle>
        </DialogHeader>
        {report && (
          <form onSubmit={onSubmit} className="space-y-4">
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
                defaultValue={report.title}
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
                defaultValue={report.description}
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
                onClick={onClose}
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
  );
}

export default EditReportDialog;
