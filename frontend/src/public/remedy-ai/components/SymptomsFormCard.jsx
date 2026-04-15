import { Activity, AlertTriangle, Stethoscope } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export function SymptomsFormCard({
  symptoms,
  setSymptoms,
  age,
  setAge,
  gender,
  setGender,
  duration,
  setDuration,
  additionalInfo,
  setAdditionalInfo,
  disabled,
  error,
  isSubmitting,
  onSubmit,
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-emerald-600" />
          Share your symptoms
        </CardTitle>
        <CardDescription>
          The more detail you provide, the more tailored the educational
          guidance can be.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-6" onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="symptoms">Symptoms</FieldLabel>
              <FieldDescription>
                Describe what you are experiencing in your own words.
              </FieldDescription>
              <Textarea
                id="symptoms"
                placeholder="For example: Fever for three days, dry cough, mild chest discomfort when breathing deeply…"
                rows={5}
                value={symptoms}
                onChange={(event) => setSymptoms(event.target.value)}
                disabled={disabled}
                aria-invalid={Boolean(error && !symptoms.trim())}
              />
            </Field>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="age">Age (optional)</FieldLabel>
                <FieldDescription>
                  This helps tailor guidance to your life stage.
                </FieldDescription>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="35"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  disabled={disabled}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="gender">Gender (optional)</FieldLabel>
                <FieldDescription>
                  If you wish to share, this can refine results.
                </FieldDescription>
                <Input
                  id="gender"
                  placeholder="e.g. Female, Male, Non-binary"
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                  disabled={disabled}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="duration">Duration (optional)</FieldLabel>
              <FieldDescription>
                How long have you been experiencing these symptoms?
              </FieldDescription>
              <Input
                id="duration"
                placeholder="e.g. 3 days, 2 weeks, since yesterday evening"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                disabled={disabled}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="additionalInfo">
                Additional context (optional)
              </FieldLabel>
              <FieldDescription>
                Medications, medical history, recent travel, or anything else
                you would like the AI to consider.
              </FieldDescription>
              <Textarea
                id="additionalInfo"
                placeholder="For example: Taking blood pressure medication, recently returned from travel, history of asthma…"
                rows={3}
                value={additionalInfo}
                onChange={(event) => setAdditionalInfo(event.target.value)}
                disabled={disabled}
              />
            </Field>
          </FieldGroup>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <CardFooter className="flex flex-col items-stretch justify-between gap-3 border-t border-slate-100 bg-slate-50/60 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-500">
              Remedy AI does not provide medical diagnoses. It offers general
              information and does not replace a consultation with a qualified
              healthcare professional.
            </p>
            <Button
              type="submit"
              disabled={disabled}
              className="inline-flex items-center gap-1.5"
            >
              <Activity className="h-4 w-4" />
              {isSubmitting ? "Analyzing…" : "Send to Remedy AI"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
