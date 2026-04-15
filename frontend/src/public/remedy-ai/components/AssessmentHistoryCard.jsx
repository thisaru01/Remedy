import { Activity } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AssessmentHistoryCard({
  isPatient,
  history,
  selectedHistoryId,
  onSelectEntry,
  getUrgencyBadgeClasses,
}) {
  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-slate-500" />
          Previous assessments
        </CardTitle>
        <CardDescription className="text-xs">
          Your recent Remedy AI assessments. Select one to view its full
          overview again.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-slate-600">
        {isPatient ? (
          history.length > 0 ? (
            <ul className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {history.map((entry) => {
                const created = new Date(entry.createdAt);
                const summary = entry?.input?.symptoms || "Symptoms";
                const urgencyLabel = entry?.assessment?.urgency;
                const isSelected = selectedHistoryId === entry.id;

                return (
                  <li
                    key={entry.id}
                    className={`cursor-pointer rounded-md border px-3 py-2 transition-colors ${
                      isSelected
                        ? "border-emerald-300 bg-emerald-50/70"
                        : "border-slate-100 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/40"
                    }`}
                    onClick={() => onSelectEntry(entry)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <p className="font-medium text-slate-900 line-clamp-1">
                          {summary}
                        </p>
                        <p className="text-[0.7rem] text-slate-500">
                          {created.toLocaleString()}
                        </p>
                      </div>
                      {urgencyLabel && (
                        <Badge
                          variant="outline"
                          className={
                            "border text-[0.65rem] font-semibold capitalize " +
                            getUrgencyBadgeClasses(urgencyLabel)
                          }
                        >
                          {urgencyLabel}
                        </Badge>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No previous assessments found yet.</p>
          )
        ) : (
          <p>Sign in as a patient to keep a history.</p>
        )}
      </CardContent>
    </Card>
  );
}
