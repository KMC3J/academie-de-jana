import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Gem, Loader2, RotateCcw, Sparkles, Star, Wand2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ApiError, apiGet, apiPost } from "@/lib/api";
import { useBadges, useProfileId } from "@/lib/academy";
import { setActivity } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QuizOut, QuizResult, Subject } from "@/lib/types";

export default function Quiz() {
  const { subjectId = "", chapterId = "" } = useParams();
  const profileId = useProfileId();
  const qc = useQueryClient();
  const { data: badges } = useBadges();
  const { data: subject } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: () => apiGet<Subject>(`/subjects/${subjectId}`),
  });
  const chapter = subject?.chapters.find((c) => c.id === chapterId);
  const [count, setCount] = useState(5);
  const [quiz, setQuiz] = useState<QuizOut | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    setActivity(subjectId);
    return () => setActivity(null);
  }, [subjectId]);

  const generate = useMutation({
    mutationFn: () =>
      apiPost<QuizOut>("/quiz/generate", { profile_id: profileId, subject_id: subjectId, chapter_id: chapterId, count }),
    onSuccess: (q) => {
      setQuiz(q);
      setAnswers(q.questions.map(() => ""));
      setIndex(0);
      setResult(null);
    },
    onError: (e) => toast.error(e instanceof ApiError ? String((e.body as { detail?: string })?.detail ?? "Erreur") : "Erreur"),
  });

  const submit = useMutation({
    mutationFn: () => apiPost<QuizResult>(`/quiz/${quiz?.id}/submit`, { answers }),
    onSuccess: (r) => {
      setResult(r);
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["today"] });
      r.new_badges.forEach((b) => toast.success(`Nouveau badge : ${badges?.find((x) => x.id === b)?.title ?? b}`));
    },
    onError: () => toast.error("La correction a échoué, réessaie."),
  });

  const q = quiz?.questions[index];
  const setAnswer = (v: string) => setAnswers((a) => a.map((x, i) => (i === index ? v : x)));
  const isLast = quiz ? index === quiz.questions.length - 1 : false;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={`/matieres/${subjectId}`} className="inline-flex items-center gap-1 text-sm text-[#C4B5FD] hover:text-white" data-testid="quiz-back-link">
        <ArrowLeft className="size-4" /> {subject?.name ?? "Retour"}
      </Link>
      <h1 className="mt-3 font-heading text-4xl font-bold text-white" data-testid="quiz-title">
        {chapter?.title ?? "Quiz magique"}
      </h1>
      <p className="text-[#C4B5FD]">{subject?.magic_name}</p>

      {!quiz && (
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-[#F59E0B]/30 bg-[#18142A] p-8" data-testid="quiz-start-panel">
          <Sparkles className="absolute top-6 right-6 size-16 animate-twinkle text-[#F59E0B]/40" />
          <h2 className="font-heading text-2xl font-bold text-white">Prête pour le sortilège ?</h2>
          <p className="mt-2 max-w-md text-[#A7A1C8]">
            Le grimoire va créer des questions de niveau 5e. Chaque bonne réponse rapporte 10 XP, et un sans-faute offre un bonus !
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="mr-2 text-sm text-[#C4B5FD]">Nombre de questions :</span>
            {[3, 5, 8].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n)}
                data-testid={`quiz-count-${n}`}
                className={`rounded-full px-4 py-1.5 font-mono text-sm transition-[background-color,color] ${
                  count === n ? "bg-[#F59E0B] text-[#1A1202]" : "bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <Button
            size="lg"
            className="mt-6 transition-[transform,box-shadow] hover:scale-105 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]"
            onClick={() => generate.mutate()}
            disabled={generate.isPending || !profileId}
            data-testid="quiz-generate-button"
          >
            {generate.isPending ? <Loader2 className="animate-spin" /> : <Wand2 />}
            {generate.isPending ? "Le grimoire écrit tes questions…" : "Lancer le quiz"}
          </Button>
        </div>
      )}

      {quiz && !result && q && (
        <div className="mt-8">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-[#FDE68A]" data-testid="quiz-progress">
              Question {index + 1} / {quiz.questions.length}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#F59E0B]"
                animate={{ width: `${((index + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="mt-5 rounded-3xl border border-[#8B5CF6]/30 bg-[#221B3D] p-6"
            >
              <p className="text-xl leading-relaxed text-white" data-testid="quiz-question">{q.question}</p>
              {q.type === "qcm" ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {q.options.map((o, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAnswer(o)}
                      data-testid={`quiz-option-${i}`}
                      className={`rounded-2xl border px-4 py-3 text-left transition-[border-color,background-color,transform] duration-150 hover:-translate-y-0.5 ${
                        answers[index] === o
                          ? "border-[#F59E0B] bg-[#F59E0B]/15 text-[#FDE68A]"
                          : "border-white/10 bg-white/[0.03] text-white hover:border-[#8B5CF6]/60"
                      }`}
                    >
                      <span className="mr-2 font-mono text-xs text-[#C4B5FD]">{String.fromCharCode(65 + i)}</span>
                      {o}
                    </button>
                  ))}
                </div>
              ) : (
                <Input
                  className="mt-5 h-12 bg-[#0D0B18] text-lg"
                  placeholder="Écris ta réponse…"
                  value={answers[index] ?? ""}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isLast && setIndex(index + 1)}
                  data-testid="quiz-short-answer-input"
                />
              )}
            </motion.div>
          </AnimatePresence>
          <div className="mt-5 flex justify-between">
            <Button variant="ghost" disabled={index === 0} onClick={() => setIndex(index - 1)} data-testid="quiz-prev-button">
              Précédente
            </Button>
            {isLast ? (
              <Button onClick={() => submit.mutate()} disabled={submit.isPending} data-testid="quiz-submit-button">
                {submit.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />} Corriger mon quiz
              </Button>
            ) : (
              <Button onClick={() => setIndex(index + 1)} data-testid="quiz-next-button">
                Suivante
              </Button>
            )}
          </div>
        </div>
      )}

      {result && quiz && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-8" data-testid="quiz-result">
          <div className="relative overflow-hidden rounded-3xl border border-[#F59E0B]/40 bg-gradient-to-br from-[#221B3D] to-[#18142A] p-8 text-center">
            <p className="font-mono text-sm text-[#C4B5FD]">Résultat</p>
            <p className="mt-1 font-heading text-6xl font-bold text-white" data-testid="quiz-score">
              {result.score} / {result.total}
            </p>
            <div className="mt-3 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <Star key={i} className={`size-8 ${i < result.stars_gained ? "fill-[#F59E0B] text-[#F59E0B]" : "text-white/20"}`} />
              ))}
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-4 font-mono text-sm">
              <span className="rounded-full bg-[#F59E0B]/15 px-4 py-1.5 text-[#FDE68A]" data-testid="quiz-xp-gained">+{result.xp_gained} XP</span>
              <span className="rounded-full bg-[#F59E0B]/15 px-4 py-1.5 text-[#FBBF24]">+{result.stars_gained} étoiles</span>
              <span className="flex items-center gap-1 rounded-full bg-[#8B5CF6]/20 px-4 py-1.5 text-[#DDD6FE]">
                <Gem className="size-4" /> +{result.crystals_gained}
              </span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {result.items.map((it, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-[#18142A] p-4" data-testid={`quiz-correction-${i}`}>
                <div className="flex items-start gap-3">
                  {it.correct ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#34D399]" />
                  ) : (
                    <XCircle className="mt-0.5 size-5 shrink-0 text-[#F87171]" />
                  )}
                  <div className="min-w-0">
                    <p className="text-white">{quiz.questions[i]?.question}</p>
                    <p className="mt-1 text-sm text-[#A7A1C8]">
                      Ta réponse : <span className={it.correct ? "text-[#6EE7B7]" : "text-[#FCA5A5]"}>{it.given || "—"}</span>
                      {!it.correct && (
                        <>
                          {" "}· Bonne réponse : <span className="text-[#6EE7B7]">{it.answer}</span>
                        </>
                      )}
                    </p>
                    {it.explanation && <p className="mt-2 text-sm text-[#DDD6FE]">{it.explanation}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => generate.mutate()} disabled={generate.isPending} data-testid="quiz-retry-button">
              {generate.isPending ? <Loader2 className="animate-spin" /> : <RotateCcw />} Nouveau quiz
            </Button>
            <Link to={`/matieres/${subjectId}`} className="inline-flex items-center rounded-lg px-4 text-sm text-[#C4B5FD] hover:text-white" data-testid="quiz-back-to-subject">
              Retour à la matière
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
