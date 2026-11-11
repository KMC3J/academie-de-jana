import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, Clock, MapPin, Swords, Wand2 } from "lucide-react";
import { apiGet } from "@/lib/api";
import { DAYS, IMAGES, formatDuration, useProfile, useProfileId, useSubjects } from "@/lib/academy";
import { MagicIcon } from "@/components/MagicIcon";
import Stardust from "@/components/Stardust";
import { buttonVariants } from "@/components/ui/button";
import type { Subject, TodayView } from "@/lib/types";

const PLACES = [
  { id: "bibliotheque", name: "La Bibliothèque", hint: "Fiches & cartes mentales", to: "/fiches", x: 22, y: 38 },
  { id: "tour-des-reves", name: "La Tour des rêves", hint: "Atelier création", to: "/atelier", x: 47, y: 18 },
  { id: "jardin", name: "Le Jardin des merveilles", hint: "Toutes les matières", to: "/matieres", x: 14, y: 70 },
  { id: "salle-des-quetes", name: "La Salle des quêtes", hint: "Tes aventures", to: "/quetes", x: 70, y: 48 },
  { id: "observatoire", name: "L'Observatoire", hint: "Professeur magique", to: "/professeur", x: 82, y: 22 },
  { id: "lac", name: "Le Lac des nombres", hint: "Calculatrice", to: "/calculatrice", x: 52, y: 80 },
];

export function subjectName(subjects: Subject[] | undefined, id: string | null, fallback = "") {
  return subjects?.find((s) => s.id === id)?.name ?? fallback;
}

export default function Accueil() {
  const id = useProfileId();
  const { data: profile } = useProfile();
  const { data: subjects } = useSubjects();
  const { data: today, isError } = useQuery({
    queryKey: ["today", id],
    queryFn: () => apiGet<TodayView>(`/profiles/${id}/today`),
    enabled: !!id,
  });

  const missionSubject = subjects?.find((s) => s.id === today?.mission_subject_id);

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Hero */}
      <section className="relative col-span-12 overflow-hidden rounded-3xl border border-[#F59E0B]/25 bg-[#18142A] lg:col-span-8">
        <img src={IMAGES.castle} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0B18] via-[#0D0B18]/85 to-transparent" />
        <Stardust count={25} />
        <div className="relative flex min-h-72 items-end gap-6 p-8">
          <div className="flex-1">
            <p className="text-sm font-medium tracking-wide text-[#FDE68A] uppercase">
              {today ? `${DAYS[today.weekday]} · ${new Date(today.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}` : "Aujourd'hui"}
            </p>
            <h1 className="mt-2 font-heading text-4xl font-bold text-white sm:text-5xl" data-testid="welcome-title">
              Bienvenue, {profile?.name ?? "apprentie"} !
            </h1>
            <div className="mt-6 max-w-lg rounded-2xl border border-[#F59E0B]/30 bg-[#1A1530]/85 p-5 backdrop-blur-xl" data-testid="daily-mission-card">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#FBBF24]">
                <Swords className="size-4" /> Mission du jour
                {today?.mission_done && (
                  <span className="ml-auto flex items-center gap-1 text-[#34D399]" data-testid="mission-done-badge">
                    <CheckCircle2 className="size-4" /> Accomplie
                  </span>
                )}
              </div>
              <p className="mt-2 text-lg text-white" data-testid="mission-text">
                {isError ? "La mission apparaîtra dès que le château se réveille." : today?.mission_text ?? "…"}
              </p>
              {today?.mission_subject_id && today.mission_chapter_id && (
                <Link
                  to={`/quiz/${today.mission_subject_id}/${today.mission_chapter_id}`}
                  data-testid="mission-start-button"
                  className={`${buttonVariants({ size: "lg" })} mt-4 transition-[transform,box-shadow] hover:scale-105 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]`}
                >
                  <Wand2 /> {today.mission_done ? "Rejouer" : "Relever le défi"}
                  {missionSubject && <span className="opacity-70">· {missionSubject.name}</span>}
                </Link>
              )}
            </div>
          </div>
          <img
            src={IMAGES.witch}
            alt="La sorcière de l'Académie"
            className="hidden w-44 animate-float rounded-3xl border border-[#8B5CF6]/30 shadow-[0_0_40px_rgba(139,92,246,0.35)] md:block"
          />
        </div>
      </section>

      {/* Today */}
      <section className="col-span-12 rounded-3xl border border-[#8B5CF6]/20 bg-[#18142A] p-6 sm:col-span-6 lg:col-span-4" data-testid="today-timetable">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-white">
            <CalendarDays className="size-5 text-[#06B6D4]" /> Cours du jour
          </h2>
          <Link to="/emploi-du-temps" className="text-xs text-[#FDE68A] hover:underline" data-testid="see-timetable-link">
            Semaine →
          </Link>
        </div>
        <ul className="mt-4 space-y-2">
          {today?.slots.map((s) => {
            const subj = subjects?.find((x) => x.id === s.subject_id);
            return (
              <li key={s.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2" data-testid={`today-slot-${s.id}`}>
                <span className="font-mono text-xs text-[#A7A1C8]">{s.start}</span>
                <span className="size-2 rounded-full" style={{ background: subj?.color ?? "#A7A1C8" }} />
                <span className="flex-1 text-sm text-white">{subj?.name ?? s.label}</span>
                {s.room && <span className="text-xs text-[#9D95C2]">{s.room}</span>}
              </li>
            );
          })}
          {today && today.slots.length === 0 && (
            <li className="text-sm text-[#A7A1C8]">Pas de cours aujourd'hui : profite pour explorer l'Académie !</li>
          )}
        </ul>
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#06B6D4]/10 px-3 py-2 text-sm text-[#BAE6FD]" data-testid="today-screen-time">
          <Clock className="size-4" /> Temps passé aujourd'hui : {formatDuration(today?.screen_seconds_today ?? 0)}
        </div>
      </section>

      {/* Map */}
      <section className="col-span-12 lg:col-span-7">
        <h2 className="mb-3 font-heading text-2xl font-bold text-white">La carte de l'Académie</h2>
        <div className="relative overflow-hidden rounded-3xl border border-[#F59E0B]/20" data-testid="academy-map">
          <img src={IMAGES.map} alt="Carte de l'Académie" className="aspect-[3/2] w-full object-cover" />
          <div className="absolute inset-0 bg-[#0D0B18]/20" />
          {PLACES.map((p, i) => (
            <motion.div
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
            >
              <Link
                to={p.to}
                data-testid={`map-place-${p.id}`}
                className="group flex items-center gap-1.5 rounded-full border border-[#F59E0B]/50 bg-[#0D0B18]/85 px-3 py-1.5 text-xs font-semibold text-[#FDE68A] backdrop-blur-md transition-[transform,box-shadow] duration-200 hover:scale-110 hover:shadow-[0_0_18px_rgba(245,158,11,0.6)]"
              >
                <MapPin className="size-3.5" />
                {p.name}
                <span className="hidden font-normal text-[#C4B5FD] group-hover:inline">· {p.hint}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick subjects */}
      <section className="col-span-12 lg:col-span-5">
        <h2 className="mb-3 font-heading text-2xl font-bold text-white">Grimoire des matières</h2>
        <div className="grid grid-cols-2 gap-3" data-testid="quick-subjects">
          {subjects?.map((s) => (
            <Link
              key={s.id}
              to={`/matieres/${s.id}`}
              data-testid={`quick-subject-${s.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-[#18142A] p-3 transition-[border-color,transform] duration-200 hover:-translate-y-0.5"
              style={{ borderColor: `${s.color}33` }}
            >
              <span className="flex size-10 items-center justify-center rounded-xl" style={{ background: `${s.color}22`, color: s.color }}>
                <MagicIcon name={s.icon} className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{s.name}</span>
                <span className="block truncate text-xs text-[#9D95C2]">{s.magic_name}</span>
              </span>
            </Link>
          ))}
          {!subjects && Array.from({ length: 6 }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5" />)}
        </div>
      </section>
    </div>
  );
}
