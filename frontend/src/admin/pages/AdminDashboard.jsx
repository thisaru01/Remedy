import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Users,
  FileText,
  CreditCard,
  DollarSign,
  RefreshCw,
  Loader2,
  Eye,
} from "lucide-react";

import * as adminUserService from "@/api/services/adminUserService";
import * as paymentService from "@/api/services/paymentService";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, paymentsRes] = await Promise.all([
        adminUserService.getUsers(),
        paymentService.getPayments(),
      ]);

      setUsers(usersRes.data?.users || []);
      setPayments(paymentsRes.data?.payments || []);
    } catch (err) {
      toast.error(err?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const totalDoctors = users.filter((u) => u.role === "doctor").length;
    const totalPatients = users.filter((u) => u.role === "patient").length;
    const activeUsers = users.filter((u) => u.status === "active").length;
    const totalRevenue = payments.reduce((sum, p) => {
      const amount =
        Number(p?.amount ?? p?.total ?? p?.price ?? p?.amountPaid ?? 0) || 0;
      return sum + amount;
    }, 0);

    return {
      totalUsers,
      totalDoctors,
      totalPatients,
      activeUsers,
      totalRevenue,
    };
  }, [users, payments]);

  const recentTransactions = payments.slice(0, 6);

  const formatCurrency = (v) => {
    if (v == null) return "-";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(Number(v));
    } catch {
      return String(v);
    }
  };

  function StatusBadge({ status }) {
    if (status === "success") {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          Success
        </Badge>
      );
    }

    if (status === "failed") {
      return (
        <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">
          Failed
        </Badge>
      );
    }

    return (
      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
        Pending
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground italic text-sm">
          Overview metrics and recent activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-1">
        <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/2 to-transparent shadow-sm">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                <div className="text-sm text-muted-foreground">
                  {metrics.activeUsers} active
                </div>
              </div>
              <Users className="w-8 h-8 opacity-60" />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/users/accounts")}
              >
                Manage Users
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/2 to-transparent shadow-sm">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Doctors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{metrics.totalDoctors}</div>
                <div className="text-sm text-muted-foreground">
                  Verified & pending
                </div>
              </div>
              <FileText className="w-8 h-8 opacity-60" />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/users/doctors")}
              >
                Review Doctors
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/2 to-transparent shadow-sm">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {metrics.totalPatients}
                </div>
                <div className="text-sm text-muted-foreground">Registered</div>
              </div>
              <CreditCard className="w-8 h-8 opacity-60" />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/users/patients")}
              >
                Patient Directory
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/2 to-transparent shadow-sm">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(metrics.totalRevenue)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total payments
                </div>
              </div>
              <DollarSign className="w-8 h-8 opacity-60" />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/transactions")}
              >
                View Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/2 to-transparent shadow-sm px-0">
        <CardHeader className="border-b border-white/5 flex items-center justify-between p-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest">
            Recent Transactions
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/transactions">View all</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
              <p className="text-lg font-medium">No recent transactions</p>
              <p className="text-xs italic opacity-60">
                Payments will appear here once processed.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((p) => (
                  <TableRow
                    key={p._id}
                    className="group hover:bg-white/1 transition-colors"
                  >
                    <TableCell className="font-mono text-xs">
                      {String(p._id).slice(-8)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {p?.patientId || p?.patientName || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {new Date(p?.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatCurrency(
                        Number(p?.amount ?? p?.total ?? p?.price ?? 0),
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p?.paymentStatus ?? p?.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/transactions`)}
                      >
                        <Eye className="w-4 h-4" /> Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
