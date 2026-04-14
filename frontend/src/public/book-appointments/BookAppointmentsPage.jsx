import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import Navbar from "@/public/components/Navbar.jsx";
import DoctorCard from "./components/DoctorCard.jsx";
import DoctorCardSkeleton from "./components/DoctorCardSkeleton.jsx";
import { useFindDoctors } from "./hooks/useFindDoctors.js";

// Constants
const SPECIALTY_OPTIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Orthopedic Surgeon",
  "Gynecologist",
  "Neurologist",
  "Psychiatrist",
  "ENT Specialist",
  "Ophthalmologist",
];

const DEBOUNCE_MS = 350;

// Hooks
function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export default function BookAppointmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Controlled inputs — initial values from URL
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [specialty, setSpecialty] = useState(
    searchParams.get("specialty") || "all",
  );

  const debouncedSearch = useDebounced(searchInput, DEBOUNCE_MS);

  // Sync URL with current filters
  useEffect(() => {
    const next = {};
    if (debouncedSearch) next.search = debouncedSearch;
    if (specialty && specialty !== "all") next.specialty = specialty;
    setSearchParams(next, { replace: true });
  }, [debouncedSearch, specialty, setSearchParams]);

  const {
    data: doctors = [],
    isLoading,
    error,
    refresh,
  } = useFindDoctors({
    search: debouncedSearch,
    specialty: specialty === "all" ? "" : specialty,
  });

  function clearFilters() {
    setSearchInput("");
    setSpecialty("all");
  }

  const hasActiveFilters =
    Boolean(debouncedSearch) || (specialty && specialty !== "all");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      {/* Header + filters */}
      <div className="border-b border-slate-200 bg-white pb-8 pt-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Book Appointments
            </h1>
            <p className="mt-2 text-slate-600">
              Search approved doctors and book an appointment that suits you.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="doctor-search"
                placeholder="Search by name, specialty, or language…"
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Specialty filter */}
            <div className="w-full sm:w-56">
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger id="specialty-filter">
                  <SelectValue placeholder="All specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All specialties</SelectItem>
                  {SPECIALTY_OPTIONS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="shrink-0 gap-1.5 text-slate-500 hover:text-slate-900"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>

          {/* Active filter badges */}
          {hasActiveFilters && (
            <>
              <Separator className="mt-4" />
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-slate-500">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters:
                </span>

                {specialty && specialty !== "all" && (
                  <Badge
                    variant="secondary"
                    className="gap-1 pr-1.5"
                    onClick={() => setSpecialty("all")}
                    role="button"
                    aria-label={`Remove specialty filter: ${specialty}`}
                  >
                    {specialty}
                    <X className="h-3 w-3 cursor-pointer" />
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 flex-1 w-full">
        {/* Results summary */}
        {!isLoading && !error && (
          <p className="mb-4 text-sm text-slate-600">
            {doctors.length === 0
              ? "No doctors found"
              : `${doctors.length} doctor${doctors.length !== 1 ? "s" : ""} found`}
          </p>
        )}

        {/* Loading */}
        {isLoading && <DoctorCardSkeleton count={6} />}

        {/* Error */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-red-200 bg-red-50 py-16 text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="font-medium text-red-600">Couldn't load doctors</p>
              <p className="mt-1 text-sm text-red-500/80">
                {error?.message || "Request failed. Please try again."}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={refresh}>
              Retry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && doctors.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">
            <Search className="h-8 w-8 opacity-40" />
            <div>
              <p className="font-medium">No doctors match your search</p>
              <p className="mt-1 text-sm">
                Try changing your search or specialty filters.
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        )}

        {/* Doctor grid */}
        {!isLoading && !error && doctors.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor._id || doctor.userId} doctor={doctor} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600">
          © {new Date().getFullYear()} Remedy
        </div>
      </footer>
    </div>
  );
}
