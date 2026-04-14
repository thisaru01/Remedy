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
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-linear-to-b from-card to-card/95 backdrop-blur-xl p-0 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
          <DialogHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black italic tracking-tighter leading-none">Review Profile</DialogTitle>
                <DialogDescription className="text-sm font-medium text-muted-foreground mt-1 tracking-tight">
                  Verification details for {selectedDoctor?.user?.name || "the doctor"}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-8 text-[11px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
              <div className="space-y-4">
                <span className="block opacity-40">Medical License Number</span>
                <span className="block text-lg font-black text-foreground tracking-tight normal-case opacity-100 font-mono italic">
                  {selectedDoctor?.verification?.medicalLicenseNumber || "NOT PROVIDED"}
                </span>
              </div>
              <div className="space-y-4">
                <span className="block opacity-40">Medical Council</span>
                <span className="block text-lg font-black text-foreground tracking-tight normal-case opacity-100 italic">
                  {selectedDoctor?.verification?.medicalCouncil || "NOT PROVIDED"}
                </span>
              </div>
            </div>

            {selectedDoctor?.verification?.licenseDocumentUrl && (
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 blur-xl" />
                <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] transition-transform duration-500 group-hover:scale-[1.01]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black italic text-base tracking-tighter">Professional Document</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest mt-1">Uploaded Evidence (PDF/Image)</p>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary font-bold">
                      <a href={selectedDoctor?.verification?.licenseDocumentUrl} target="_blank" rel="noopener noreferrer">
                        View Original <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-8 border-t border-white/5 bg-white/[0.01] flex sm:justify-between items-center gap-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic flex-1 truncate">
              STATUS: {selectedDoctor?.verification?.status?.toUpperCase()}
            </div>
            {selectedDoctor?.verification?.status === "submitted" && (
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="rounded-xl px-6 py-5 h-auto border-rose-500/20 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/40 font-bold gap-2 shadow-sm transition-all duration-300"
                  onClick={() => handleAction("reject", selectedDoctor?._id)}
                >
                  <XCircle className="w-4 h-4" /> REJECT
                </Button>
                <Button 
                  className="rounded-xl px-10 py-5 h-auto bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-95 font-black italic tracking-tighter gap-2 transition-all duration-500"
                  onClick={() => handleAction("approve", selectedDoctor?._id)}
                >
                  <CheckCircle className="w-4 h-4" /> APPROVE ACCOUNT
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
