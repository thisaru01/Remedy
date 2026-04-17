import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ShieldCheck, Loader2, Link as LinkIcon, Building, AlertCircle } from "lucide-react";

export function VerificationForm({ onSubmit, loading, error }) {
  const [formData, setFormData] = useState({
    medicalLicenseNumber: "",
    medicalCouncil: "",
    licenseDocumentUrl: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.medicalLicenseNumber.trim()) newErrors.medicalLicenseNumber = "License number is required";
    if (!formData.medicalCouncil.trim()) newErrors.medicalCouncil = "Medical council is required";
    if (!formData.licenseDocumentUrl.trim()) newErrors.licenseDocumentUrl = "Document link is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="border-primary/20 bg-linear-to-b from-primary/[0.03] to-transparent shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Professional Verification</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Provide your official registry details to unlock your profile.
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="license">Medical License Number</Label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="license"
                value={formData.medicalLicenseNumber}
                onChange={(e) => setFormData({ ...formData, medicalLicenseNumber: e.target.value })}
                placeholder="e.g. MC-12345678"
                className={`pl-9 ${errors.medicalLicenseNumber ? "border-destructive" : ""}`}
              />
            </div>
            {errors.medicalLicenseNumber && (
              <p className="text-xs text-destructive">{errors.medicalLicenseNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="council">Medical Council</Label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="council"
                value={formData.medicalCouncil}
                onChange={(e) => setFormData({ ...formData, medicalCouncil: e.target.value })}
                placeholder="e.g. SLMC, GMC, Medical Board of NY"
                className={`pl-9 ${errors.medicalCouncil ? "border-destructive" : ""}`}
              />
            </div>
            {errors.medicalCouncil && (
              <p className="text-xs text-destructive">{errors.medicalCouncil}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">License Document Link (Google Drive/Dropbox)</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="document"
                value={formData.licenseDocumentUrl}
                onChange={(e) => setFormData({ ...formData, licenseDocumentUrl: e.target.value })}
                placeholder="https://drive.google.com/..."
                className={`pl-9 ${errors.licenseDocumentUrl ? "border-destructive" : ""}`}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Please provide a public/shared link to a scanned copy of your license.
            </p>
            {errors.licenseDocumentUrl && (
              <p className="text-xs text-destructive">{errors.licenseDocumentUrl}</p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Verification"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
