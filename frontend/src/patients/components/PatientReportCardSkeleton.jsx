import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientReportCardSkeleton() {
  return (
    <Card className="flex h-full flex-col justify-between border border-border/60 bg-card">
      <CardHeader className="flex flex-row items-start gap-3 pb-2">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between gap-2 border-t bg-muted/40 py-2">
        <Skeleton className="h-7 w-16" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>
      </CardFooter>
    </Card>
  );
}
