import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Eye,
  CheckCircle,
  XCircle,
  ShieldAlert,
  FileText,
  ExternalLink,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAdminDoctors } from "@/hooks/useAdminDoctors";

export function DoctorManagement() {
  const {
    pendingDoctors,
    approvedDoctors,
    rejectedDoctors,
    loading,
    approveDoctor,
    rejectDoctor
  } = useAdminDoctors();

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const handleReview = (doctor) => {
    setSelectedDoctor(doctor);
    setIsReviewOpen(true);
  };

  const handleAction = async (action, doctorId) => {
    if (action === "approve") {
      await approveDoctor(doctorId);
    } else {
      await rejectDoctor(doctorId);
    }
    setIsReviewOpen(false);
  };

  const DoctorTable = ({ list, statusType }) => {
    if (loading && list.length === 0) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
        </div>
      );
    }

    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
          <AlertCircle className="w-12 h-12 opacity-10 mb-4" />
          <p className="text-lg font-medium">No results found</p>
          <p className="text-xs italic opacity-60">There are currently no doctors in this category.</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-white/5">
            <TableHead className="w-[300px] font-bold py-4">Doctor</TableHead>
            <TableHead className="font-bold">Specialty</TableHead>
            <TableHead className="font-bold">License #</TableHead>
            <TableHead className="font-bold">Status</TableHead>
            <TableHead className="text-right font-bold pr-8">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((doc) => (
            <TableRow key={doc._id} className="border-white/5 hover:bg-white/[0.01] transition-colors group">
              <TableCell className="py-4">
                <div className="font-bold text-base group-hover:text-primary transition-colors">
                  {doc.user?.name || "Dr. Anonymous"}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-medium tracking-tighter opacity-60">
                  Last Updated {new Date(doc.updatedAt).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-semibold px-3 text-[11px]">
                  {doc.specialty}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs opacity-70">
                {doc.verification?.medicalLicenseNumber || "N/A"}
              </TableCell>
              <TableCell>
                {statusType === "pending" && (
                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">Pending Review</Badge>
                )}
                {statusType === "approved" && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Approved</Badge>
                )}
                {statusType === "rejected" && (
                  <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20">Rejected</Badge>
                )}
              </TableCell>
              <TableCell className="text-right pr-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-primary/10 hover:text-primary font-bold gap-2"
                  onClick={() => handleReview(doc)}
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-1 px-1">
        <h2 className="text-3xl font-bold tracking-tight">Doctor Management</h2>
        <p className="text-muted-foreground italic text-sm">
          Categorized overview of all medical professional accounts.
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-xl grid-cols-3 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="pending" className="rounded-lg gap-2">
            <Clock className="w-4 h-4" /> Pending
            {pendingDoctors.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-[20px] rounded-full p-1 flex items-center justify-center text-[10px]">
                {pendingDoctors.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-lg gap-2">
            <CheckCircle2 className="w-4 h-4" /> Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-lg gap-2">
            <AlertCircle className="w-4 h-4" /> Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/[0.02] to-transparent shadow-sm">
            <CardHeader className="border-b border-white/5 bg-white/[0.01] py-4">
              <div className="flex items-center gap-2 text-amber-500">
                <ShieldAlert className="w-4 h-4" />
                <CardTitle className="text-sm font-bold uppercase tracking-widest">Awaiting Verification</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DoctorTable list={pendingDoctors} statusType="pending" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/[0.02] to-transparent shadow-sm">
            <CardHeader className="border-b border-white/5 bg-white/[0.01] py-4">
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="w-4 h-4" />
                <CardTitle className="text-sm font-bold uppercase tracking-widest">Verified Professionals</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DoctorTable list={approvedDoctors} statusType="approved" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/[0.02] to-transparent shadow-sm">
            <CardHeader className="border-b border-white/5 bg-white/[0.01] py-4">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertCircle className="w-4 h-4" />
                <CardTitle className="text-sm font-bold uppercase tracking-widest">Declined Profiles</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DoctorTable list={rejectedDoctors} statusType="rejected" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-xl sm:max-w-2xl rounded-xl">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Review Profile: {selectedDoctor?.user?.name || "Doctor"}
            </DialogTitle>
            <DialogDescription>
              Please verify the professional credentials for this doctor before taking action.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-lg border">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Medical License Number</p>
                <p className="text-lg font-bold tracking-tight text-foreground font-mono">
                  {selectedDoctor?.verification?.medicalLicenseNumber || "Not Provided"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Medical Council</p>
                <p className="text-lg font-bold tracking-tight text-foreground">
                  {selectedDoctor?.verification?.medicalCouncil || "Not Provided"}
                </p>
              </div>
            </div>

            {selectedDoctor?.verification?.licenseDocumentUrl && (
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">License Document</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Original uploaded file</p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-2 shrink-0">
                  <a href={selectedDoctor?.verification?.licenseDocumentUrl} target="_blank" rel="noopener noreferrer">
                    View Document <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider bg-secondary/50 px-3 py-1.5 rounded-full border">
              Status: <span className={
                selectedDoctor?.verification?.status === "approved" ? "text-emerald-600 font-bold ml-1" :
                  selectedDoctor?.verification?.status === "rejected" ? "text-rose-600 font-bold ml-1" :
                    "text-amber-600 font-bold ml-1"
              }>{selectedDoctor?.verification?.status?.toUpperCase()}</span>
            </div>
            {selectedDoctor?.verification?.status === "submitted" && (
              <div className="flex w-full sm:w-auto items-center gap-3">
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto gap-2"
                  onClick={() => handleAction("reject", selectedDoctor?.userId)}
                >
                  <XCircle className="w-4 h-4" /> Reject
                </Button>
                <Button
                  variant="default"
                  className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleAction("approve", selectedDoctor?.userId)}
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
