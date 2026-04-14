import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Clock, CheckCircle2, XCircle } from "lucide-react";

export function DoctorVerificationTable({ doctors, loading, onReview }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed bg-muted/20">
        <p className="text-muted-foreground">No doctors found for this status.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Approved</Badge>;
      case "submitted":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
      default:
        return <Badge variant="outline">Not Submitted</Badge>;
    }
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Doctor ID</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor.userId} className="hover:bg-muted/5 transition-colors">
              <TableCell className="font-mono text-xs text-muted-foreground">
                {doctor.userId}
              </TableCell>
              <TableCell className="font-medium">
                {doctor.specialty || "Not set"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(doctor.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {getStatusBadge(doctor.verification?.status)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReview(doctor)}
                  className="gap-2 h-8"
                >
                  <Eye className="w-4 h-4" /> Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
