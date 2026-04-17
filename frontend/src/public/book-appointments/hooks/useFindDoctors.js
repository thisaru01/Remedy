import { useEffect, useState, useCallback } from "react";

import {
  getApprovedDoctors,
  getApprovedDoctorsBySpecialty,
  getDoctorDetails,
} from "@/api/services/doctorService";

export function useFindDoctors({ search = "", specialty = "" } = {}) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response;

      if (specialty) {
        response = await getApprovedDoctorsBySpecialty(specialty);
      } else {
        response = await getApprovedDoctors();
      }

      const raw = response?.data?.profiles ?? response?.data ?? [];
      let list = Array.isArray(raw) ? raw : [];

      // Enrich doctor profiles with display name/photo where possible
      try {
        const enriched = await Promise.all(
          list.map(async (doctor) => {
            const userId =
              doctor.userId || doctor.user?._id || doctor._id || null;
            if (!userId) return doctor;

            try {
              const detailResp = await getDoctorDetails(userId);
              const detail =
                detailResp?.data?.profile || detailResp?.data?.data;
              if (!detail) return doctor;

              return {
                ...doctor,
                doctorName:
                  detail.doctorName ||
                  detail.user?.name ||
                  doctor.doctorName,
                profilePhoto:
                  detail.profilePhoto ||
                  detail.user?.profilePhoto ||
                  doctor.profilePhoto,
              };
            } catch {
              return doctor;
            }
          }),
        );
        list = enriched;
      } catch {
        // If enrichment fails, continue with raw list
      }

      const query = search.trim().toLowerCase();
      if (query) {
        list = list.filter((doctor) => {
          const name = doctor?.doctorName || doctor?.user?.name || "";
          const specialtyText = doctor?.specialty || "";
          const bio = doctor?.bio || "";
          const languages = Array.isArray(doctor?.languages)
            ? doctor.languages.join(" ")
            : "";
          const hospitals = Array.isArray(doctor?.workingHospitals)
            ? doctor.workingHospitals
                .map((h) => h?.hospitalName || "")
                .join(" ")
            : "";

          const haystack =
            `${name} ${specialtyText} ${bio} ${languages} ${hospitals}`.toLowerCase();
          return haystack.includes(query);
        });
      }

      setData(list);
    } catch (err) {
      setError(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, specialty]);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  const refresh = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { data, isLoading, error, refresh };
}
