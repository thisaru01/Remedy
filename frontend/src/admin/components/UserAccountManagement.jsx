import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, Search, UserCheck, UserX } from "lucide-react";

import * as adminUserService from "@/api/services/adminUserService";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ROLE_OPTIONS = [
  { value: "all", label: "All roles" },
  { value: "patient", label: "Patients" },
  { value: "doctor", label: "Doctors" },
  { value: "admin", label: "Admins" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function StatusBadge({ status }) {
  if (status === "active") {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
        Active
      </Badge>
    );
  }

  return (
    <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20">
      Inactive
    </Badge>
  );
}

function RoleBadge({ role }) {
  const label = (role ?? "").toUpperCase() || "UNKNOWN";

  if (role === "admin") {
    return (
      <Badge
        variant="outline"
        className="border-primary/20 bg-primary/5 text-primary"
      >
        {label}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-white/10 bg-white/2">
      {label}
    </Badge>
  );
}

export function UserAccountManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [nextStatus, setNextStatus] = useState("inactive");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminUserService.getUsers({
        role: roleFilter === "all" ? undefined : roleFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      setUsers(res.data?.users || []);
    } catch (err) {
      toast.error(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter]);

  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const name = String(u?.name ?? "").toLowerCase();
      const email = String(u?.email ?? "").toLowerCase();
      const role = String(u?.role ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || role.includes(q);
    });
  }, [users, search]);

  const openConfirm = (user) => {
    const current = user?.status;
    const desired = current === "active" ? "inactive" : "active";
    setTargetUser(user);
    setNextStatus(desired);
    setConfirmOpen(true);
  };

  const applyStatusChange = async () => {
    if (!targetUser?.id) return;

    try {
      setActionLoadingId(targetUser.id);
      await adminUserService.updateUserStatus({
        userId: targetUser.id,
        status: nextStatus,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, status: nextStatus } : u,
        ),
      );

      toast.success(
        nextStatus === "active" ? "Account activated" : "Account deactivated",
      );
    } catch (err) {
      toast.error(err?.message || "Failed to update user status");
    } finally {
      setActionLoadingId(null);
      setConfirmOpen(false);
      setTargetUser(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 px-1">
        <h2 className="text-3xl font-bold tracking-tight">User Accounts</h2>
        <p className="text-muted-foreground italic text-sm">
          Activate or deactivate user access.
        </p>
      </div>

      <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/2 to-transparent shadow-sm">
        <CardHeader className="border-b border-white/5 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">
              Accounts
            </CardTitle>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-40" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, role..."
                  className="pl-10 h-10 rounded-xl bg-white/2 border-white/5"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10 rounded-xl border-white/5 bg-white/2">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 rounded-xl border-white/5 bg-white/2">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-white/5"
                onClick={fetchUsers}
                disabled={loading}
              >
                {loading ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="ml-2">Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
            </div>
          ) : visibleUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
              <p className="text-lg font-medium">No users found</p>
              <p className="text-xs italic opacity-60">
                Try adjusting filters or search.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="w-[340px] font-bold py-4">
                    User
                  </TableHead>
                  <TableHead className="font-bold">Role</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Created</TableHead>
                  <TableHead className="text-right font-bold pr-8">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleUsers.map((u) => {
                  const isBusy = actionLoadingId === u.id;
                  const isActive = u.status === "active";

                  return (
                    <TableRow
                      key={u.id}
                      className="border-white/5 hover:bg-white/1 transition-colors group"
                    >
                      <TableCell className="py-4">
                        <div className="font-bold text-base">
                          {u?.name || "Unnamed"}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-medium opacity-70">
                          {u?.email || "No email"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <RoleBadge role={u?.role} />
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={u?.status} />
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {u?.createdAt
                          ? new Date(u.createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>

                      <TableCell className="text-right pr-6">
                        <Button
                          type="button"
                          variant={isActive ? "destructive" : "default"}
                          size="sm"
                          className={
                            isActive
                              ? "gap-2"
                              : "gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                          }
                          onClick={() => openConfirm(u)}
                          disabled={isBusy}
                        >
                          {isBusy ? (
                            <Loader2
                              className="w-4 h-4 animate-spin"
                              aria-hidden="true"
                            />
                          ) : isActive ? (
                            <UserX className="w-4 h-4" aria-hidden="true" />
                          ) : (
                            <UserCheck className="w-4 h-4" aria-hidden="true" />
                          )}
                          {isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {nextStatus === "inactive"
                ? "Deactivate account"
                : "Activate account"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {nextStatus === "inactive"
                ? "This user will not be able to sign in until reactivated."
                : "This user will regain access to sign in."}
              <div className="mt-2 text-foreground">
                <span className="font-medium">{targetUser?.name}</span>
                {targetUser?.email ? ` (${targetUser.email})` : ""}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoadingId != null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                applyStatusChange();
              }}
              disabled={actionLoadingId != null}
              className={
                nextStatus === "inactive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }
            >
              {actionLoadingId != null ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Working
                </span>
              ) : nextStatus === "inactive" ? (
                "Deactivate"
              ) : (
                "Activate"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
