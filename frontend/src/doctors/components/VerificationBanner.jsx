import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Info } from "lucide-react";

export function VerificationBanner() {
  return (
    <div className="space-y-4">
      <Alert variant="destructive" className="border-red-500/20 bg-red-500/5 backdrop-blur-sm">
        <ShieldAlert className="h-4 w-4 text-red-500" />
        <AlertTitle className="text-red-500 font-bold">Action Required: Verification Pending</AlertTitle>
        <AlertDescription className="text-red-500/80">
          Your professional profile is currently locked. You must submit your medical license and council details for verification before you can update your public profile or take appointments.
        </AlertDescription>
      </Alert>
      
      <Alert className="border-blue-500/20 bg-blue-500/5 backdrop-blur-sm">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-500 font-semibold">Important Note</AlertTitle>
        <AlertDescription className="text-blue-500/80">
          Verification typically takes 24-48 hours. Once approved, all professional features will be unlocked automatically.
        </AlertDescription>
      </Alert>
    </div>
  );
}
