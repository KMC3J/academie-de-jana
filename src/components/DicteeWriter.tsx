import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Lightbulb,
  ListChecks,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import { useProfileId } from "@/lib/academy";
import { correctDictee, DICTEES, type Dictee } from "@/data/dictees";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Creation } from "@/lib/types";

const LEVEL_LABEL: Record<Dictee["level"], string> = {
  facile: "Facile",
  moyen: "Moyen",
  difficile: "Difficile",
};
const LEVEL_STYLE: Record<Dictee["level"], string> = {
  facile: "bg-[#10B981]/20 text-[#6EE7B7]",
  moyen: "bg-[#F59E0B]/20 text-[#FDE68A]",
  difficile: "bg-[#EC4899]/20 text-[#FBCFE8]",
};

/** Lecture vocale de la dictée (voix française du navigateur). */
function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!supported) return;
    const stop = () => setSpeaking(false);
    window.speechSynthesis.addEventListener?.("voiceschanged", () => undefined);
    return () => {
      window.speechSynthesis.cancel();
      stop();
    };
  }, [supported]);

  const speak = (text: string, rate: number) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = rate;
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("fr"));
    if (voice) u.voice = voice;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return { supported, speaking, speak, stop };
}

export default function DicteeWriter() {
  const profileId = useProfileId();
  const qc = useQueryClient();
  const [dicteeId, setDicteeId] = useState(DICTEES[0].id);
  const [answer, setAnswer] = useState("");
  const [showText, setShowText] = useState(false);
  const [rate, setRate] = useState(0.9);
  const [checked, setChecked] = useState(false);
  const speech = useSpeech();

  const dictee = DICTEES.find((d) => d.id === dicteeId) ?? DICTEES[0];
  const result = useMemo(() => (checked ? correctDictee(dictee, answer) : null), [checked, dictee, answer]);

  const save = useMutation({
    mutationFn: (body: { kind: "histoire"; title: string; content: string }) => apiPost<Creation>(`/profiles/${profileId}/creations`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["creations", profileId] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const reset = () => {
    setAnswer("");
    setChecked(false);
    setShowText(false);
    speech.stop();
  };

  const check = () => {
    if (!answer.trim()) {
      toast.error("Écris d'abord ta dictée avant de la corriger.");
      return;
    }
    const r = correctDictee(dictee, answer);
    setChecked(true);
    speech.stop();
    toast.success(`Dictée corrigée : ${r.score} %`);
    // Sauvegarde dans « Mes créations » avec la copie corrigée.
    save.mutate({
      kind: "histoire",
      title: `Dictée — ${dictee.title} (${r.score} %)`,
      content: `Ma dictée :\n${answer.trim()}\n\nTexte attendu :\n${dictee.text}\n\nRésultat : ${r.correctWords}/${r.totalWords} mots corrects (${r.score} %).`,
    });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2" data-testid="dictee-picker">
          {DICTEES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setDicteeId(d.id);
                reset();
              }}
              data-testid={`dictee-choice-${d.id}`}
              className={`rounded-full px-4 py-1.5 text-sm transition-[background-color] ${
                d.id === dicteeId ? "bg-[#F59E0B] text-[#1A1202]" : "bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-[#8B5CF6]/25 bg-[#18142A] p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${LEVEL_STYLE[dictee.level]}`}>
              {LEVEL_LABEL[dictee.level]}
            </span>
            <span className="flex-1 text-sm text-[#C4B5FD]" data-testid="dictee-hint">
              <Lightbulb className="mr-1 inline size-4 text-[#FDE68A]" /> {dictee.hint}
            </span>
            <label className="flex items-center gap-2 text-xs text-[#A7A1C8]">
              Vitesse
              <input
                type="range"
                min={0.5}
                max={1.3}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-24 accent-[#F59E0B]"
                data-testid="dictee-rate-slider"
              />
              <span className="font-mono">{rate.toFixed(1)}×</span>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() => speech.speak(dictee.text, rate)}
              disabled={!speech.supported}
              data-testid="dictee-listen-button"
            >
              <Play /> Écouter la dictée
            </Button>
            <Button variant="outline" onClick={speech.stop} disabled={!speech.speaking} data-testid="dictee-stop-button">
              <Square /> Stop
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowText((s) => !s)}
              data-testid="dictee-toggle-text-button"
            >
              {showText ? <EyeOff /> : <Eye />} {showText ? "Cacher le texte" : "Voir le texte"}
            </Button>
          </div>

          {!speech.supported && (
            <p className="mt-3 text-sm text-[#FCA5A5]">
              La synthèse vocale n'est pas disponible dans ce navigateur : utilise « Voir le texte » pour te faire dicter par un adulte.
            </p>
          )}

          {showText && (
            <div className="mt-4 rounded-2xl bg-[#F5ECD7] p-5 font-heading text-lg leading-relaxed text-[#2A1E0F]" data-testid="dictee-text">
              {dictee.text}
            </div>
          )}

          <Textarea
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setChecked(false);
            }}
            placeholder="Écris ici ce que tu entends…"
            className="mt-4 min-h-40 bg-[#F5ECD7] font-heading text-lg leading-relaxed text-[#2A1E0F] placeholder:text-[#2A1E0F]/40"
            data-testid="dictee-answer-input"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-xs text-[#A7A1C8]" data-testid="dictee-word-count">
              {answer.trim() ? answer.trim().split(/\s+/).length : 0} mot(s) écrit(s)
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={reset} data-testid="dictee-reset-button">
                <RotateCcw /> Recommencer
              </Button>
              <Button onClick={check} disabled={save.isPending} data-testid="dictee-correct-button">
                <ListChecks /> Corriger ma dictée
              </Button>
            </div>
          </div>
        </div>

        {result && (
          <div className="rounded-3xl border border-[#F59E0B]/40 bg-gradient-to-br from-[#221B3D] to-[#18142A] p-5" data-testid="dictee-result">
            <div className="flex flex-wrap items-center gap-4">
              <p className="font-heading text-4xl font-bold text-white" data-testid="dictee-score">
                {result.score} %
              </p>
              <p className="text-sm text-[#C4B5FD]">
                {result.correctWords} / {result.totalWords} mots corrects
              </p>
              <span className="flex items-center gap-1 rounded-full bg-[#8B5CF6]/20 px-3 py-1 font-mono text-xs text-[#DDD6FE]">
                <Sparkles className="size-3.5" /> +10 XP
              </span>
            </div>

            <p className="mt-4 text-xs font-semibold tracking-wide text-[#FDE68A] uppercase">Comparaison mot à mot</p>
            <p className="mt-2 flex flex-wrap gap-x-1.5 gap-y-1 text-lg leading-relaxed" data-testid="dictee-diff">
              {result.diff.map((d, i) =>
                d.status === "extra" ? (
                  <span key={i} className="rounded bg-[#F87171]/20 px-1 text-[#FCA5A5] line-through" title="Mot en trop">
                    {d.word}
                  </span>
                ) : d.status === "ok" ? (
                  <span key={i} className="text-[#6EE7B7]">
                    {d.word}
                  </span>
                ) : (
                  <span key={i} className="flex items-baseline gap-1">
                    <span className="rounded bg-[#F87171]/20 px-1 text-[#FCA5A5] line-through" title="Mot à corriger ou manquant">
                      {d.word}
                    </span>
                    {d.status === "missing" && (
                      <span className="text-xs text-[#FDE68A]" title="Mot oublié">
                        (oublié)
                      </span>
                    )}
                  </span>
                ),
              )}
            </p>

            <p className="mt-4 text-xs font-semibold tracking-wide text-[#FDE68A] uppercase">Les pièges de cette dictée</p>
            <ul className="mt-2 space-y-2" data-testid="dictee-traps">
              {dictee.traps.map((t) => {
                const missed = result.trapsMissed.includes(t.word);
                return (
                  <li key={t.word} className="flex items-start gap-2 text-sm">
                    {missed ? (
                      <XCircle className="mt-0.5 size-4 shrink-0 text-[#F87171]" />
                    ) : (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#34D399]" />
                    )}
                    <span>
                      <span className="font-semibold text-white">{t.word}</span>
                      <span className="text-[#A7A1C8]"> — {t.why}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <aside className="rounded-3xl border border-[#F59E0B]/25 bg-[#221B3D] p-5">
        <p className="flex items-center gap-2 font-heading text-xl font-bold text-white">
          <Volume2 className="size-5 text-[#FDE68A]" /> Comment ça marche
        </p>
        <ol className="mt-3 space-y-2 text-sm text-[#DDD6FE]">
          <li>1. Choisis une dictée et sa difficulté.</li>
          <li>2. Écoute-la (ou demande à un adulte de te la lire).</li>
          <li>3. Écris le texte dans le cadre, sans regarder.</li>
          <li>4. Clique sur « Corriger ma dictée ».</li>
          <li>5. Compare mot à mot et relis les pièges.</li>
        </ol>
        <p className="mt-4 rounded-2xl bg-white/5 p-3 text-xs text-[#A7A1C8]">
          La correction est automatique et immédiate : les mots faux ou oubliés apparaissent en rouge, les mots justes en vert.
          Chaque dictée corrigée est enregistrée dans « Mes créations ».
        </p>
      </aside>
    </div>
  );
}
