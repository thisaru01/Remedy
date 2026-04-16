import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, Search, Eye } from "lucide-react";

import * as paymentService from "@/api/services/paymentService";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function StatusBadge({ status }) {
  if (status === "success") {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
        Success
      </Badge>
    );
  }

  if (status === "failed") {
    return (
      <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20">
        Failed
      </Badge>
    );
  }

  return (
    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">
      Pending
    </Badge>
  );
}

export default function AdminTransactions() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getPayments();
      setPayments(res.data?.payments || []);
    } catch (err) {
      toast.error(err?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payments;

    return payments.filter((p) => {
      const keys = [
        p?._id,
        p?.appointmentId,
        p?.patientId,
        p?.doctorId,
        p?.paymentStatus,
        p?.provider,
        p?.currency,
        p?.checkoutSessionId,
        p?.providerPaymentIntentId,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());

      return keys.some((v) => v.includes(q));
    });
  }, [payments, search]);

  const openDetails = (payment) => {
    setSelected(payment);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground italic text-sm">
          Full list of payment records.
        </p>
      </div>

      <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/2 to-transparent shadow-sm">
        <CardHeader className="border-b border-white/5 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">
              Payments
            </CardTitle>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-40" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by IDs, status, provider..."
                  className="pl-10 h-10 rounded-xl bg-white/2 border-white/5"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-white/5"
                onClick={fetchPayments}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="ml-2">Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading && payments.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-xs italic opacity-60">
                Try a different search.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="w-85 font-bold py-4">Payment</TableHead>
                  <TableHead className="font-bold">Amount</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Provider</TableHead>
                  <TableHead className="font-bold">Created</TableHead>
                  <TableHead className="text-right font-bold pr-8">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((p) => (
                  <TableRow
                    key={p?._id}
                    className="border-white/5 hover:bg-white/1 transition-colors group"
                  >
                    <TableCell className="py-4">
                      <div className="font-bold text-sm">{p?._id}</div>
                      <div className="text-[11px] text-muted-foreground font-medium opacity-70">
                        Appt: {p?.appointmentId || "—"}
                      </div>
                    </TableCell>

                    <TableCell className="text-sm font-semibold">
                      {typeof p?.amount === "number" ? p.amount : "—"} {p?.currency || ""}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={p?.paymentStatus} />
                    </TableCell>

                    <TableCell className="text-sm">{p?.provider || "—"}</TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {p?.createdAt
                        ? new Date(p.createdAt).toLocaleString()
                        : "—"}
                    </TableCell>

                    <TableCell className="text-right pr-6">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10 hover:text-primary font-bold gap-2"
                        onClick={() => openDetails(p)}
                      >
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" /> Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-xl sm:max-w-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle>Transaction details</DialogTitle>
            <DialogDescription>
              Payment record fields as stored in the payment service.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Payment ID</div>
              <div className="font-mono break-all">{selected?._id || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <div>
                <StatusBadge status={selected?.paymentStatus} />
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Appointment ID</div>
              <div className="font-mono break-all">{selected?.appointmentId || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Provider</div>
              <div className="font-mono break-all">{selected?.provider || "—"}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Patient ID</div>
              <div className="font-mono break-all">{selected?.patientId || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Doctor ID</div>
              <div className="font-mono break-all">{selected?.doctorId || "—"}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Amount</div>
              <div className="font-mono">
                {typeof selected?.amount === "number" ? selected.amount : "—"} {selected?.currency || ""}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Currency</div>
              <div className="font-mono">{selected?.currency || "—"}</div>
            </div>

            <div className="sm:col-span-2">
              <div className="text-xs text-muted-foreground">Checkout session</div>
              <div className="font-mono break-all">{selected?.checkoutSessionId || "—"}</div>
            </div>

            <div className="sm:col-span-2">
              <div className="text-xs text-muted-foreground">Payment intent</div>
              <div className="font-mono break-all">{selected?.providerPaymentIntentId || "—"}</div>
            </div>

            <div className="sm:col-span-2">
              <div className="text-xs text-muted-foreground">Failure reason</div>
              <div className="wrap-break-word">{selected?.failureReason || "—"}</div>
            </div>

            <div className="sm:col-span-2">
              <div className="text-xs text-muted-foreground">Checkout URL</div>
              <div className="font-mono break-all">{selected?.checkoutUrl || "—"}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
