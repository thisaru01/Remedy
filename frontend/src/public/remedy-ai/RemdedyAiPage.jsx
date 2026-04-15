import { useEffect, useState } from "react";

import { Activity, AlertTriangle, Brain, Stethoscope } from "lucide-react";

import Navbar from "@/public/components/Navbar.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/context/auth/useAuth";
import axios from "@/api/axios";

function getUrgencyBadgeClasses(urgency) {
  switch (urgency) {
    case "high":
      return "border-red-200 bg-red-50 text-red-700";
    case "moderate":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "low":
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
}

export default function RemdedyAiPage() {
  const { isAuthenticated, role, userId } = useAuth();
  const isPatient = isAuthenticated && role === "patient";

  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [duration, setDuration] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  // Load saved history for this patient from the API
  useEffect(() => {
    let cancelled = false;

    async function fetchHistory() {
      if (!isPatient || !userId) {
        setHistory([]);
        return;
      }

      try {
        const response = await axios.get("/ai/symptom-check/history", {
          params: { limit: 20 },
        });
        const items = response?.data?.items ?? [];
        if (!cancelled) {
          setHistory(items);
          setSelectedHistoryId(null);
        }
      } catch {
        if (!cancelled) {
          setHistory([]);
        }
      }
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [isPatient, userId]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!symptoms.trim()) {
      setError("Please describe your symptoms so we can help.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        symptoms: symptoms.trim(),
        age: age || undefined,
        gender: gender || undefined,
        duration: duration || undefined,
        additionalInfo: additionalInfo || undefined,
      };

      const response = await axios.post("/ai/symptom-check", payload);
      const nextAssessment = response?.data?.assessment ?? null;
      setAssessment(nextAssessment);
      setSelectedHistoryId(null);

      if (nextAssessment && userId) {
        const entry = {
          id: Date.now(),
          createdAt: new Date().toISOString(),
          input: payload,
          assessment: nextAssessment,
        };

        setHistory((prev) => {
          const next = [entry, ...prev].slice(0, 20);
          return next;
        });
      }
    } catch (err) {
      setAssessment(null);

      const status = err?.status;
      const message = String(err?.message || "");

      if (
        status === 502 ||
        status === 503 ||
        message.includes("high demand") ||
        message.includes("Service Unavailable")
      ) {
        setError(
          "Remedy AI is temporarily unavailable due to high demand. Please try again in a few moments.",
        );
      } else {
        setError(
          message ||
            "Unable to get an AI assessment right now. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const disabled = !isPatient || isSubmitting;

  const urgency = assessment?.urgency || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="mx-auto flex-1 w-full max-w-6xl px-4 py-10">
        <header className="mb-8">
          <Badge
            variant="outline"
            className="mb-3 inline-flex items-center gap-1.5 rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
          >
            <Brain className="h-3.5 w-3.5" />
            Remedy AI symptom checker
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Describe how you are feeling
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Remedy AI turns your symptoms into structured, educational guidance
            about what might be going on, which doctors to consider, and how
            urgent it may be to seek care.
          </p>
        </header>

        {!isPatient && (
          <Card className="mb-6 border-amber-200 bg-amber-50/70">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                  <AlertTriangle className="h-4 w-4" />
                  Sign in as a patient to use Remedy AI
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-amber-900/80">
                  For your safety and privacy, the AI symptom checker is
                  available only to authenticated patient accounts.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
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
              <form className="space-y-6" onSubmit={handleSubmit}>
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
                      <FieldLabel htmlFor="gender">
                        Gender (optional)
                      </FieldLabel>
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
                    <FieldLabel htmlFor="duration">
                      Duration (optional)
                    </FieldLabel>
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
                      Medications, medical history, recent travel, or anything
                      else you would like the AI to consider.
                    </FieldDescription>
                    <Textarea
                      id="additionalInfo"
                      placeholder="For example: Taking blood pressure medication, recently returned from travel, history of asthma…"
                      rows={3}
                      value={additionalInfo}
                      onChange={(event) =>
                        setAdditionalInfo(event.target.value)
                      }
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
                    Remedy AI does not provide medical diagnoses. It offers
                    general information and does not replace a consultation with
                    a qualified healthcare professional.
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

          <div className="space-y-4">
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
                            {assessment.possibleConditions.map(
                              (condition, index) => (
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
                              ),
                            )}
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
                      Once you send your symptoms, Remedy AI will provide a
                      structured overview of possible conditions, urgency, and
                      which specialties might be most appropriate to consult.
                    </p>
                    <p>
                      This is informational only and must not be used for
                      emergencies or as a substitute for professional medical
                      advice, diagnosis, or treatment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-slate-500" />
                  Previous assessments
                </CardTitle>
                <CardDescription className="text-xs">
                  Your recent Remedy AI assessments. Select one to view its
                  full overview again.
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
                            onClick={() => {
                              setAssessment(entry.assessment);
                              setSelectedHistoryId(entry.id);
                            }}
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
                    <p>No previous assessments saved yet on this device.</p>
                  )
                ) : (
                  <p>Sign in as a patient to keep a local history.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600">
          © {new Date().getFullYear()} Remedy
        </div>
      </footer>
    </div>
  );
}
