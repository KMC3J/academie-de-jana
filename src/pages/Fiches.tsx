import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookMarked, Network } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useSubjects } from "@/lib/academy";
import type { Sheet } from "@/lib/types";

export function MindMap({ sheet, color }: { sheet: Sheet; color: string }) {
  return (
    <div className="relative" data-testid="mind-map">
      <div className="flex justify-center">
        <div
          className="rounded-full px-8 py-4 text-center font-heading text-2xl font-bold text-[#1A1202] shadow-[0_0_40px_rgba(245,158,11,0.45)]"
          style={{ background: `linear-gradient(135deg, #FDE68A, ${color})` }}
        >
          {sheet.content || sheet.title}
        </div>
      </div>
      <div className="mx-auto h-8 w-px bg-[#F59E0B]/50" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sheet.branches.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl border bg-[#221B3D] p-4"
            style={{ borderColor: `${color}55` }}
          >
            <p className="font-semibold" style={{ color }}>{b.label}</p>
            <ul className="mt-2 space-y-1">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-2 text-sm text-[#EDE9FE]">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#F59E0B]" /> {it}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Fiches() {
  const [params, setParams] = useSearchParams();
  const { data: subjects } = useSubjects();
  const { data: sheets, isError } = useQuery({ queryKey: ["sheets", "all"], queryFn: () => apiGet<Sheet[]>("/sheets") });
  const filter = params.get("matiere") ?? "all";
  const list = sheets?.filter((s) => filter === "all" || s.subject_id === filter) ?? [];
  const selected = sheets?.find((s) => s.id === params.get("sheet")) ?? list[0];
  const subjOf = (id: string) => subjects?.find((s) => s.id === id);

  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    if (k === "matiere") next.delete("sheet");
    setParams(next);
  };

  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-[#FDE68A] uppercase">La Bibliothèque</p>
      <h1 className="mt-1 font-heading text-4xl font-bold text-white">Fiches méthodes & cartes mentales</h1>
      <div className="mt-6 flex flex-wrap gap-2" data-testid="sheet-subject-filter">
        <button
          type="button"
          onClick={() => set("matiere", null)}
          data-testid="sheet-filter-all"
          className={`rounded-full px-4 py-1.5 text-sm transition-[background-color] ${filter === "all" ? "bg-[#F59E0B] text-[#1A1202]" : "bg-white/5 text-white hover:bg-white/10"}`}
        >
          Toutes
        </button>
        {subjects?.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => set("matiere", s.id)}
            data-testid={`sheet-filter-${s.id}`}
            className={`rounded-full px-4 py-1.5 text-sm transition-[background-color] ${filter === s.id ? "bg-[#F59E0B] text-[#1A1202]" : "bg-white/5 text-white hover:bg-white/10"}`}
          >
            {s.name}
          </button>
        ))}
      </div>
      {isError && <p className="mt-4 text-sm text-[#C084FC]">Les fiches apparaîtront dès que le château se réveille.</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        <ul className="space-y-2" data-testid="sheet-list">
          {list.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => set("sheet", s.id)}
                data-testid={`sheet-item-${s.id}`}
                className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-[border-color,background-color] ${
                  selected?.id === s.id ? "border-[#F59E0B]/60 bg-[#F59E0B]/10" : "border-white/5 bg-[#18142A] hover:border-[#8B5CF6]/40"
                }`}
              >
                {s.kind === "carte" ? <Network className="mt-0.5 size-4 text-[#06B6D4]" /> : <BookMarked className="mt-0.5 size-4 text-[#FDE68A]" />}
                <span>
                  <span className="block text-sm font-semibold text-white">{s.title}</span>
                  <span className="text-xs text-[#9D95C2]">
                    {subjOf(s.subject_id)?.name} · {s.kind === "carte" ? "Carte mentale" : "Méthode"}
                  </span>
                </span>
              </button>
            </li>
          ))}
          {sheets && list.length === 0 && <li className="text-sm text-[#A7A1C8]">Aucune fiche ici pour l'instant.</li>}
        </ul>

        <article className="rounded-3xl border border-[#8B5CF6]/25 bg-[#18142A] p-6 sm:p-8" data-testid="sheet-viewer">
          {selected ? (
            <>
              <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: subjOf(selected.subject_id)?.color ?? "#FDE68A" }}>
                {subjOf(selected.subject_id)?.name} · {selected.kind === "carte" ? "Carte mentale" : "Fiche méthode"}
              </p>
              <h2 className="mt-1 mb-6 font-heading text-3xl font-bold text-white" data-testid="sheet-title">{selected.title}</h2>
              {selected.kind === "carte" ? (
                <MindMap sheet={selected} color={subjOf(selected.subject_id)?.color ?? "#8B5CF6"} />
              ) : (
                <div className="rounded-2xl bg-[#F5ECD7] p-6 text-[15px] leading-relaxed whitespace-pre-wrap text-[#2A1E0F] shadow-inner" data-testid="sheet-method-content">
                  {selected.content}
                </div>
              )}
            </>
          ) : (
            <p className="text-[#A7A1C8]">Choisis une fiche à gauche.</p>
          )}
        </article>
      </div>
    </div>
  );
}
