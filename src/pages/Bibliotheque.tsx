import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Check, ChevronRight, Clock, Library, Sparkles, X } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { useProfileId, useSubjects } from "@/lib/academy";
import { BOOK_KIND_LABEL } from "@/data/library";
import type { Book } from "@/data/library";
import { Button } from "@/components/ui/button";

type Result = { score: number; total: number; xp_gained: number };

export default function Bibliotheque() {
  const { data: subjects } = useSubjects();
  const id = useProfileId();
  const { data: books } = useQuery({ queryKey: ["books"], queryFn: () => apiGet<Book[]>("/books") });
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [read, setRead] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [saving, setSaving] = useState(false);

  const list = useMemo(() => (books ?? []).filter((b) => filter === "all" || b.subject_id === filter), [books, filter]);
  const book = books?.find((b) => b.id === openId) ?? null;
  const subjOf = (sid: string) => subjects?.find((s) => s.id === sid);

  const open = (b: Book) => {
    setOpenId(b.id);
    setAnswers({});
    setResult(null);
    if (!read.includes(b.id)) setRead((r) => [...r, b.id]);
  };

  const correct = book ? book.questions.filter((q, i) => answers[i] === q.answer).length : 0;
  const allAnswered = book ? book.questions.every((_, i) => answers[i] !== undefined) : false;

  const validate = async () => {
    if (!book || !id) return;
    setSaving(true);
    try {
      const r = await apiPost<Result>("/reading/submit", {
        profile_id: id,
        subject_id: book.subject_id,
        book_id: book.id,
        score: correct,
        total: book.questions.length,
      });
      setResult(r);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-medium tracking-wide text-[#FDE68A] uppercase">
        <Library className="size-4" /> La petite bibliothèque
      </p>
      <h1 className="mt-1 font-heading text-4xl font-bold text-white">Livres à lire</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#A7A1C8]">
        Des lectures courtes (3 à 6 minutes), choisies pour la 5e. Lis, puis réponds aux deux questions : les étoiles tombent dans ton profil.
      </p>

      {!book && (
        <>
          <div className="mt-6 flex flex-wrap gap-2" data-testid="book-subject-filter">
            <button
              type="button"
              onClick={() => setFilter("all")}
              data-testid="book-filter-all"
              className={`rounded-full px-4 py-1.5 text-sm transition-[background-color] ${filter === "all" ? "bg-[#F59E0B] text-[#1A1202]" : "bg-white/5 text-white hover:bg-white/10"}`}
            >
              Tous les rayons
            </button>
            {(subjects ?? []).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setFilter(s.id)}
                data-testid={`book-filter-${s.id}`}
                className={`rounded-full px-4 py-1.5 text-sm transition-[background-color] ${filter === s.id ? "bg-[#F59E0B] text-[#1A1202]" : "bg-white/5 text-white hover:bg-white/10"}`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((b, i) => {
              const color = subjOf(b.subject_id)?.color ?? "#F59E0B";
              return (
                <motion.button
                  key={b.id}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => open(b)}
                  data-testid={`book-card-${b.id}`}
                  className="group flex h-full flex-col rounded-3xl border border-white/5 bg-[#18142A] p-5 text-left transition-[border-color,transform] hover:-translate-y-1 hover:border-[#F59E0B]/50"
                >
                  <span
                    className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    style={{ background: `${color}22`, color }}
                  >
                    <BookOpen className="size-3" /> {BOOK_KIND_LABEL[b.kind]}
                  </span>
                  <h2 className="mt-3 font-heading text-xl leading-snug font-bold text-white">{b.title}</h2>
                  <p className="mt-1 text-xs text-[#9D95C2]">{b.author} · {subjOf(b.subject_id)?.name}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[#C7C0E0]">{b.summary}</p>
                  <span className="mt-4 flex items-center gap-2 text-xs text-[#A7A1C8]">
                    <Clock className="size-3.5" /> {b.minutes} min
                    {read.includes(b.id) && (
                      <span className="ml-auto flex items-center gap-1 text-[#6EE7B7]"><Check className="size-3.5" /> lu</span>
                    )}
                    <ChevronRight className={`size-4 text-[#F59E0B] ${read.includes(b.id) ? "" : "ml-auto"}`} />
                  </span>
                </motion.button>
              );
            })}
            {books && list.length === 0 && <p className="text-sm text-[#A7A1C8]">Aucun livre dans ce rayon pour l'instant.</p>}
          </div>
        </>
      )}

      {book && (
        <div className="mt-6" data-testid="book-reader">
          <Button variant="ghost" size="sm" className="text-[#A7A1C8]" onClick={() => setOpenId(null)}>
            <X /> Fermer le livre
          </Button>

          <article className="mt-3 rounded-3xl border border-[#8B5CF6]/25 bg-[#18142A] p-6 sm:p-10">
            <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: subjOf(book.subject_id)?.color ?? "#FDE68A" }}>
              {BOOK_KIND_LABEL[book.kind]} · {subjOf(book.subject_id)?.name} · {book.minutes} min
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-white">{book.title}</h1>
            <p className="mt-1 text-sm text-[#A7A1C8]">{book.author}</p>

            <div className="mt-6 space-y-8">
              {book.chapters.map((c, ci) => (
                <section key={ci}>
                  <h2 className="font-heading text-xl font-bold text-[#FDE68A]">{c.title}</h2>
                  <div className="mt-3 space-y-3">
                    {c.text.map((p, pi) => (
                      <p key={pi} className="text-[15px] leading-7 text-[#EDE9FE]">{p}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-5" data-testid="book-quiz">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
                <Sparkles className="size-4 text-[#F59E0B]" /> As-tu bien lu ?
              </h2>
              {book.questions.map((q, qi) => (
                <div key={qi} className="mt-4">
                  <p className="text-sm font-semibold text-[#EDE9FE]">{qi + 1}. {q.q}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {q.options.map((o) => {
                      const chosen = answers[qi] === o;
                      const done = result !== null;
                      const good = o === q.answer;
                      return (
                        <button
                          key={o}
                          type="button"
                          disabled={done}
                          onClick={() => setAnswers((a) => ({ ...a, [qi]: o }))}
                          data-testid={`book-choice-${qi}-${o}`}
                          className={`rounded-full border px-3 py-1.5 text-xs transition-[background-color,border-color] ${
                            done && good
                              ? "border-[#10B981] bg-[#10B981]/20 text-[#A7F3D0]"
                              : done && chosen
                                ? "border-[#E11D48] bg-[#E11D48]/20 text-[#FECDD3]"
                                : chosen
                                  ? "border-[#F59E0B] bg-[#F59E0B]/20 text-[#FDE68A]"
                                  : "border-white/10 text-[#C7C0E0] hover:border-[#F59E0B]/50"
                          }`}
                        >
                          {o}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!result ? (
                <Button className="mt-4" disabled={!allAnswered || saving} onClick={validate} data-testid="book-validate">
                  {saving ? "La bibliothèque compte…" : "Valider mes réponses"}
                </Button>
              ) : (
                <p className="mt-4 text-sm text-[#A7F3D0]" data-testid="book-result">
                  {correct}/{book.questions.length} bonnes réponses · +{result.xp_gained} XP. {correct === book.questions.length ? "Sans faute, la magie est là !" : "Relis le passage et réessaie quand tu veux."}
                </p>
              )}
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
