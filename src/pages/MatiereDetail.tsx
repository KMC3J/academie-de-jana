import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, GraduationCap, ScrollText, Wand2 } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useProfile } from "@/lib/academy";
import { MagicIcon } from "@/components/MagicIcon";
import { setActivity } from "@/components/Shell";
import { buttonVariants } from "@/components/ui/button";
import type { Sheet, Subject } from "@/lib/types";

export default function MatiereDetail() {
  const { id = "" } = useParams();
  const { data: profile } = useProfile();
  const { data: subject, isError } = useQuery({
    queryKey: ["subject", id],
    queryFn: () => apiGet<Subject>(`/subjects/${id}`),
  });
  const { data: sheets } = useQuery({
    queryKey: ["sheets", id],
    queryFn: () => apiGet<Sheet[]>(`/sheets?subject_id=${id}`),
  });
  useEffect(() => {
    setActivity(id);
    return () => setActivity(null);
  }, [id]);

  const color = subject?.color ?? "#8B5CF6";

  return (
    <div>
      <Link to="/matieres" className="inline-flex items-center gap-1 text-sm text-[#C4B5FD] hover:text-white" data-testid="back-to-subjects">
        <ArrowLeft className="size-4" /> Toutes les matières
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <span className="flex size-16 items-center justify-center rounded-3xl" style={{ background: `${color}22`, color }}>
          <MagicIcon name={subject?.icon ?? "book"} className="size-8" />
        </span>
        <div className="flex-1">
          <h1 className="font-heading text-4xl font-bold text-white" data-testid="subject-title">
            {subject?.name ?? (isError ? "Matière" : "…")}
          </h1>
          <p className="text-[#C4B5FD]">{subject?.magic_name}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#18142A] px-4 py-2 font-mono text-sm text-[#FDE68A]">
          {profile?.subject_xp[id] ?? 0} XP dans cette matière
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <h2 className="font-heading text-2xl font-bold text-white">Chapitres</h2>
          <div className="mt-4 space-y-3" data-testid="chapter-list">
            {subject?.chapters.map((c, i) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border bg-[#18142A] p-4 transition-[border-color] duration-200 hover:border-[#F59E0B]/50"
                style={{ borderColor: `${color}30` }}
                data-testid={`chapter-${c.id}`}
              >
                <span className="flex size-10 items-center justify-center rounded-full font-mono text-sm font-bold" style={{ background: `${color}25`, color }}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{c.title}</p>
                  {c.description && <p className="text-sm text-[#9D95C2]">{c.description}</p>}
                </div>
                <Link
                  to={`/quiz/${id}/${c.id}`}
                  data-testid={`chapter-quiz-button-${c.id}`}
                  className={`${buttonVariants({ size: "sm" })} transition-[transform,box-shadow] hover:scale-105 hover:shadow-[0_0_16px_rgba(245,158,11,0.5)]`}
                >
                  <Wand2 /> Quiz IA
                </Link>
              </div>
            ))}
            {subject && subject.chapters.length === 0 && (
              <p className="text-sm text-[#A7A1C8]">Aucun chapitre pour l'instant — un parent peut en ajouter dans l'espace parent.</p>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-[#8B5CF6]/25 bg-[#221B3D] p-5">
            <h3 className="flex items-center gap-2 font-heading text-xl font-bold text-white">
              <ScrollText className="size-5 text-[#FDE68A]" /> Fiches de la Bibliothèque
            </h3>
            <ul className="mt-3 space-y-2">
              {sheets?.map((s) => (
                <li key={s.id}>
                  <Link to={`/fiches?sheet=${s.id}`} className="block rounded-xl bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10" data-testid={`subject-sheet-${s.id}`}>
                    <span className="mr-2 text-xs text-[#FDE68A]">{s.kind === "carte" ? "Carte mentale" : "Méthode"}</span>
                    {s.title}
                  </Link>
                </li>
              ))}
              {sheets?.length === 0 && <li className="text-sm text-[#C4B5FD]">Pas encore de fiche pour cette matière.</li>}
            </ul>
          </div>
          <Link
            to={`/professeur?matiere=${id}`}
            data-testid="ask-teacher-button"
            className="flex items-center gap-3 rounded-3xl border border-[#06B6D4]/30 bg-[#06B6D4]/10 p-5 text-[#BAE6FD] transition-[transform] duration-200 hover:-translate-y-0.5"
          >
            <GraduationCap className="size-6" />
            <span>
              <span className="block font-semibold text-white">Une question ?</span>
              Demande à Dame Morgane, la professeure magique.
            </span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
