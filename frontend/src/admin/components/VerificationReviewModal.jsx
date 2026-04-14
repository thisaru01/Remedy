import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Building,
  FileText
} from "lucide-react";

export function VerificationReviewModal({ 
  doctor, 
  open, 
  onOpenChange, 
  onApprove, 
  onReject, 
  loading 
}) {
  if (!doctor) return null;

  const verification = doctor.verification || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-(--w-xl) border-white/5 bg-linear-to-b from-card to-background">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle>Verification Review</DialogTitle>
          </div>
          <DialogDescription>
            Carefully review the medical credentials below before approving or rejecting.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-white/5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> License Number
              </Label>
              <p className="font-mono text-sm tracking-tight">{verification.medicalLicenseNumber || "N/A"}</p>
            </div>
            <div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-white/5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                <Building className="w-3 h-3" /> Medical Council
              </Label>
              <p className="text-sm">{verification.medicalCouncil || "N/A"}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Supporting Document</Label>
            <div className="flex items-center justify-between p-4 rounded-xl border bg-primary/5 border-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Medical License Copy</p>
                  <p className="text-xs text-muted-foreground">Digital Document</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="gap-2 h-8">
                <a href={verification.licenseDocumentUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5" /> View
                </a>
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-0 sm:justify-between border-t border-white/5 pt-6 mt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              onClick={() => onReject(doctor.userId)}
              disabled={loading}
              className="gap-2 px-6"
            >
              <XCircle className="w-4 h-4" /> Reject
            </Button>
            <Button
              variant="default"
              onClick={() => onApprove(doctor.userId)}
              disabled={loading}
              className="gap-2 px-6 bg-green-600 hover:bg-green-700 text-white border-none"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
