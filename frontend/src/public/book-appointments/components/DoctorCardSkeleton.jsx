import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

/**
 * Skeleton placeholder that matches DoctorCard's layout.
 * @param {{ count?: number }} props
 */
export default function DoctorCardSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden border border-border bg-card shadow-sm"
        >
          <CardContent className="flex flex-col gap-4 p-5">
            {/* Header */}
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>

            {/* Languages */}
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>
          </CardContent>

          <CardFooter className="mt-auto flex flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end">
            <Skeleton className="h-9 w-full rounded-md sm:w-40" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
