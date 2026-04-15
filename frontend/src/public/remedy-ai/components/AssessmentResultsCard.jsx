import { AlertTriangle, Stethoscope } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AssessmentResultsCard({
  assessment,
  urgency,
  getUrgencyBadgeClasses,
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Stethoscope className="h-4 w-4 text-emerald-600" />
          {assessment ? "Preliminary AI assessment" : "Your results"}
        </CardTitle>
        <CardDescription className="text-xs">
          {assessment
            ? "Review this information and decide, together with a clinician, on your next steps."
            : "Your AI-generated overview will appear here after you send your symptoms."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {assessment ? (
          <>
            {urgency && (
              <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  <span className="font-medium">Estimated urgency</span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    "border text-xs font-semibold capitalize " +
                    getUrgencyBadgeClasses(urgency)
                  }
                >
                  {urgency}
                </Badge>
              </div>
            )}

            {assessment.overview && (
              <section className="space-y-1">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Overview
                </h2>
                <p className="whitespace-pre-line text-sm text-slate-800">
                  {assessment.overview}
                </p>
              </section>
            )}

            {Array.isArray(assessment.possibleConditions) &&
              assessment.possibleConditions.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Possible conditions
                  </h2>
                  <div className="space-y-2">
                    {assessment.possibleConditions.map((condition, index) => (
                      <div
                        key={`${condition.name || "condition"}-${index}`}
                        className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <p className="font-medium text-slate-900">
                            {condition.name || "Condition"}
                          </p>
                          {condition.likelihood && (
                            <Badge
                              variant="outline"
                              className="border-slate-200 bg-white text-[0.65rem] uppercase tracking-wide text-slate-600"
                            >
                              {condition.likelihood}
                            </Badge>
                          )}
                        </div>
                        {condition.reasoning && (
                          <p className="mt-1 text-xs text-slate-600">
                            {condition.reasoning}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {Array.isArray(assessment.recommendedSpecialties) &&
              assessment.recommendedSpecialties.length > 0 && (
                <section className="space-y-1">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Recommended specialties
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {assessment.recommendedSpecialties.map(
                      (specialty, index) => (
                        <Badge
                          key={`${specialty || "specialty"}-${index}`}
                          variant="secondary"
                          className="bg-slate-100 text-[0.7rem] font-medium text-slate-800"
                        >
                          {specialty}
                        </Badge>
                      ),
                    )}
                  </div>
                </section>
              )}

            {Array.isArray(assessment.redFlags) &&
              assessment.redFlags.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-red-500">
                    Red flags
                  </h2>
                  <ul className="list-disc space-y-1 pl-5 text-xs text-red-600">
                    {assessment.redFlags.map((flag, index) => (
                      <li key={`${flag || "flag"}-${index}`}>{flag}</li>
                    ))}
                  </ul>
                </section>
              )}

            {assessment.disclaimer && (
              <section className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                {assessment.disclaimer}
              </section>
            )}
          </>
        ) : (
          <div className="space-y-2 text-xs text-slate-500">
            <p>
              Once you send your symptoms, Remedy AI will provide a structured
              overview of possible conditions, urgency, and which specialties
              might be most appropriate to consult.
            </p>
            <p>
              This is informational only and must not be used for emergencies or
              as a substitute for professional medical advice, diagnosis, or
              treatment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
