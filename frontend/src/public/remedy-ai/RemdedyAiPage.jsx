import { useEffect, useState } from "react";

import { AlertTriangle, Brain } from "lucide-react";

import Navbar from "@/public/components/Navbar.jsx";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth/useAuth";
import axios from "@/api/axios";

import { SymptomsFormCard } from "@/public/remedy-ai/components/SymptomsFormCard.jsx";
import { AssessmentHistoryCard } from "@/public/remedy-ai/components/AssessmentHistoryCard.jsx";
import { AssessmentResultsCard } from "@/public/remedy-ai/components/AssessmentResultsCard.jsx";

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

        <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <SymptomsFormCard
            symptoms={symptoms}
            setSymptoms={setSymptoms}
            age={age}
            setAge={setAge}
            gender={gender}
            setGender={setGender}
            duration={duration}
            setDuration={setDuration}
            additionalInfo={additionalInfo}
            setAdditionalInfo={setAdditionalInfo}
            disabled={disabled}
            error={error}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />

          <div className="space-y-4">
            <AssessmentHistoryCard
              isPatient={isPatient}
              history={history}
              selectedHistoryId={selectedHistoryId}
              onSelectEntry={(entry) => {
                setAssessment(entry.assessment);
                setSelectedHistoryId(entry.id);
              }}
              getUrgencyBadgeClasses={getUrgencyBadgeClasses}
            />
          </div>
        </div>

        <div className="mt-6">
          <AssessmentResultsCard
            assessment={assessment}
            urgency={urgency}
            getUrgencyBadgeClasses={getUrgencyBadgeClasses}
          />
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
