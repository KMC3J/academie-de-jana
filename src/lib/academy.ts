import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { apiGet } from "@/lib/api";
import type { BadgeDef, Profile, Subject } from "@/lib/types";

const KEY = "academie.profile";
const listeners = new Set<() => void>();

// Choisir un profil réécrit aussi la route (utile si le serveur a renvoyé la racine).
function syncRoute(path: string) {
  if (typeof window !== "undefined" && window.location.pathname !== path) {
    window.history.replaceState(null, "", path);
  }
}

export function setCurrentProfile(id: string | null) {
  if (id) localStorage.setItem(KEY, id);
  else localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
  if (id) syncRoute("/accueil");
}

export function useProfileId(): string | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => localStorage.getItem(KEY),
  );
}

export function useProfile() {
  const id = useProfileId();
  return useQuery({
    queryKey: ["profile", id],
    queryFn: () => apiGet<Profile>(`/profiles/${id}`),
    enabled: !!id,
  });
}

export function useSubjects() {
  return useQuery({ queryKey: ["subjects"], queryFn: () => apiGet<Subject[]>("/subjects") });
}

export function useBadges() {
  return useQuery({ queryKey: ["badges"], queryFn: () => apiGet<BadgeDef[]>("/badges"), staleTime: Infinity });
}

export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
}

// Images servies localement (dossier public/images) : plus aucune dépendance à un CDN externe.
const base = import.meta.env.BASE_URL ?? "/";
export const IMAGES = {
  castle: `${base}images/castle.jpg`,
  witch: `${base}images/witch.jpg`,
  map: `${base}images/map.jpg`,
};
