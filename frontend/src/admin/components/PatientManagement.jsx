import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Users, 
  Search,
  UserPlus,
  Loader2,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PatientManagement() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tighter italic">Patient Directory</h2>
          <p className="text-muted-foreground italic text-sm">
            Manage registered patients and their access status.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 rounded-xl font-bold gap-2 self-start md:self-center">
          <UserPlus className="w-4 h-4" /> Add Patient
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 rounded-2xl border-white/5 bg-linear-to-b from-white/[0.02] to-transparent shadow-sm">
          <CardHeader className="border-b border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Users className="w-4 h-4" /> Registered Patients
              </CardTitle>
              <Badge variant="outline" className="font-mono text-[10px] opacity-60">
                TOTAL: 0
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-40" />
                <Input 
                  placeholder="Search by name, email or ID..." 
                  className="pl-10 h-10 rounded-xl bg-white/[0.02] border-white/5"
                />
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/5">
                <Filter className="w-4 h-4 opacity-60" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground text-center">
              <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6 animate-pulse">
                <Users className="w-10 h-10 opacity-10" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-foreground">Initialising Directory...</h3>
              <p className="text-xs italic opacity-60 max-w-xs mx-auto mt-2">
                The patient database module is connecting. Detailed records will be available shortly.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/5 bg-linear-to-b from-white/[0.02] to-transparent shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-60">System Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-[10px] uppercase font-bold text-primary mb-1 tracking-widest">Active Patients</p>
              <p className="text-2xl font-black italic tracking-tighter">0</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/20 border border-white/5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-widest">New Signups (24h)</p>
              <p className="text-2xl font-black italic tracking-tighter">0</p>
            </div>
            <div className="pt-4 text-[10px] italic text-muted-foreground leading-relaxed">
              Patient management enables administrators to monitor health data access and user activity logs.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-primary text-primary-foreground",
    outline: "border border-input bg-background hover:bg-accent",
    destructive: "bg-destructive text-destructive-foreground"
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
