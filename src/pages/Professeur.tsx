import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BrainCircuit, Eraser, KeyRound, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiGet, apiStream } from "@/lib/api";
import { getAiConfig, getTeacherMode, PROVIDERS, setAiConfig, setTeacherMode, type ProviderId, type TeacherMode } from "@/lib/provider";
import { IMAGES, useProfile, useProfileId, useSubjects } from "@/lib/academy";
import { setActivity } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ChatMessage, Ok } from "@/lib/types";

const SUGGESTIONS = [
  "Comment additionner deux fractions ?",
  "Explique-moi le passé simple",
  "C'est quoi un vassal ?",
  "Aide-moi à réviser le présent simple en anglais",
];

export default function Professeur() {
  const id = useProfileId();
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  const { data: subjects } = useSubjects();
  const [params] = useSearchParams();
  const [subjectId, setSubjectId] = useState(params.get("matiere") ?? "all");
  const [text, setText] = useState("");
  const [pending, setPending] = useState<{ user: string; reply: string } | null>(null);
  const [ai, setAi] = useState(getAiConfig);
  const [showKey, setShowKey] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  const [modelDraft, setModelDraft] = useState(ai.model);
  const [mode, setMode] = useState<TeacherMode>(getTeacherMode);
  const aiReady = ai.apiKey.trim().length > 0;
  const providerDef = PROVIDERS.find((p) => p.id === ai.provider) ?? PROVIDERS[0];
  const chooseMode = (m: TeacherMode) => { setMode(m); setTeacherMode(m); };
  const bottom = useRef<HTMLDivElement>(null);

  const { data: history } = useQuery({
    queryKey: ["chat", id],
    queryFn: () => apiGet<ChatMessage[]>(`/chat/${id}`),
    enabled: !!id,
  });

  useEffect(() => {
    setActivity(subjectId === "all" ? null : subjectId);
    return () => setActivity(null);
  }, [subjectId]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history, pending]);

  const ask = useMutation({
    mutationFn: async (message: string) => {
      setPending({ user: message, reply: "" });
      await apiStream(
        "/chat/stream",
        { profile_id: id, message, subject_id: subjectId === "all" ? null : subjectId },
        (d) => setPending((p) => (p ? { ...p, reply: p.reply + d } : p)),
      );
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ["chat", id] });
      setPending(null);
    },
    onError: () => toast.error("La magie a vacillé, réessaie dans un instant."),
  });
  const clear = useMutation({
    mutationFn: () => apiDelete<Ok>(`/chat/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat", id] }),
  });

  const send = (m: string) => {
    const msg = m.trim();
    if (!msg || ask.isPending) return;
    setText("");
    ask.mutate(msg);
  };

  const label = (v: string) => (v === "all" ? "Toutes les matières" : subjects?.find((s) => s.id === v)?.name ?? "Matière");

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <div className="overflow-hidden rounded-3xl border border-[#8B5CF6]/30 bg-[#18142A]">
          <img src={IMAGES.witch} alt="Dame Morgane" className="aspect-square w-full object-cover" />
          <div className="p-5">
            <h1 className="font-heading text-2xl font-bold text-white">Dame Morgane</h1>
            <p className="mt-1 text-sm text-[#A7A1C8]">
              La professeure magique t'explique les leçons et te guide avec des indices — elle ne donne pas directement les réponses !
            </p>
          </div>
        </div>
        <div className="rounded-3xl border border-white/5 bg-[#18142A] p-4">
          <p className="mb-2 text-xs text-[#C4B5FD]">Matière de la question</p>
          <Select value={subjectId} onValueChange={(v: string) => setSubjectId(v)}>
            <SelectTrigger className="w-full" data-testid="teacher-subject-select">
              <SelectValue>{(v: unknown) => label(v as string)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les matières</SelectItem>
              {subjects?.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" className="mt-3 text-[#A7A1C8]" onClick={() => clear.mutate()} data-testid="teacher-clear-button">
            <Eraser /> Effacer la conversation
          </Button>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#18142A] p-4" data-testid="teacher-ai-panel">
          <p className="flex items-center gap-2 text-xs text-[#C4B5FD]">
            <BrainCircuit className="size-4" /> Cerveau de Dame Morgane
          </p>
          <p className="mt-2 text-xs leading-relaxed" data-testid="teacher-ai-status">
            {aiReady ? (
              <span className="text-[#6EE7B7]">IA connectée ({providerDef.label} · {ai.model}).</span>
            ) : (
              <span className="text-[#FCA5A5]">Mode leçons : réponses préparées à partir des fiches. Ajoute une clé gratuite pour une vraie IA.</span>
            )}
          </p>

          {showKey ? (
            <div className="mt-3 space-y-2">
              <select
                className="w-full rounded-lg border border-white/10 bg-[#0D0B18] px-2 py-1.5 text-xs text-white"
                value={ai.provider}
                onChange={(e) => {
                  const id = e.target.value as ProviderId;
                  const def = PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
                  setModelDraft(def.model);
                  setAi({ ...ai, provider: id, model: def.model });
                }}
                data-testid="teacher-ai-provider"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}{p.free ? " — gratuit" : " — payant"}</option>
                ))}
              </select>
              <p className="text-[11px] leading-snug text-[#9D95C2]">{providerDef.hint}</p>
              <input
                type="password"
                className="w-full rounded-lg border border-white/10 bg-[#0D0B18] px-2 py-1.5 text-xs text-white"
                placeholder="Colle ta clé API ici"
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                data-testid="teacher-ai-key"
              />
              <input
                className="w-full rounded-lg border border-white/10 bg-[#0D0B18] px-2 py-1.5 text-xs text-white"
                placeholder="Modèle"
                value={modelDraft}
                onChange={(e) => setModelDraft(e.target.value)}
                data-testid="teacher-ai-model"
              />
              <a
                href={providerDef.keyUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-[11px] text-[#FDE68A] underline"
                data-testid="teacher-ai-keylink"
              >
                Obtenir une clé gratuite {providerDef.label} →
              </a>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  data-testid="teacher-ai-save"
                  onClick={() => {
                    const next = { ...ai, apiKey: keyDraft.trim(), model: modelDraft.trim() || providerDef.model };
                    setAi(next);
                    setAiConfig(next);
                    setShowKey(false);
                    toast.success(next.apiKey ? "IA connectée !" : "Clé retirée : mode leçons.");
                  }}
                >
                  Enregistrer
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowKey(false)}>Annuler</Button>
              </div>
              <p className="text-[11px] leading-snug text-[#7C77A0]">
                La clé reste dans ce navigateur et n'est envoyée qu'au fournisseur choisi.
              </p>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 text-[#C4B5FD]"
              onClick={() => { setKeyDraft(ai.apiKey); setModelDraft(ai.model); setShowKey(true); }}
              data-testid="teacher-ai-configure"
            >
              <KeyRound /> {aiReady ? "Changer de clé" : "Connecter une IA gratuite"}
            </Button>
          )}

          <div className="mt-4 border-t border-white/5 pt-3">
            <p className="text-xs text-[#C4B5FD]">Façon de répondre</p>
            <div className="mt-2 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => chooseMode("lesson")}
                data-testid="teacher-mode-lesson"
                className={`rounded-lg px-2 py-1.5 text-left text-xs transition-[background-color] ${mode === "lesson" ? "bg-[#F59E0B] text-[#1A1202]" : "bg-white/5 text-[#C7C0E0] hover:bg-white/10"}`}
              >
                Explications directes, avec exemples
              </button>
              <button
                type="button"
                onClick={() => chooseMode("socratic")}
                data-testid="teacher-mode-socratic"
                className={`rounded-lg px-2 py-1.5 text-left text-xs transition-[background-color] ${mode === "socratic" ? "bg-[#F59E0B] text-[#1A1202]" : "bg-white/5 text-[#C7C0E0] hover:bg-white/10"}`}
              >
                Méthode socratique (indices d'abord)
              </button>
            </div>
          </div>
        </div>
      </aside>

      <section className="flex min-h-[70vh] flex-col rounded-3xl border border-[#8B5CF6]/25 bg-[#120F22]">
        <div className="flex-1 space-y-4 overflow-y-auto p-6" data-testid="chat-messages">
          {history?.length === 0 && !pending && (
            <div className="py-10 text-center">
              <Sparkles className="mx-auto size-10 text-[#F59E0B]" />
              <p className="mt-3 font-heading text-2xl text-white">Bonjour {profile?.name} !</p>
              <p className="text-[#A7A1C8]">Pose-moi une question sur tes leçons.</p>
              <div className="mx-auto mt-5 flex max-w-xl flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    data-testid={`teacher-suggestion-${i}`}
                    className="rounded-full border border-[#8B5CF6]/40 px-4 py-2 text-sm text-[#DDD6FE] transition-[background-color] hover:bg-[#8B5CF6]/20"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {history?.map((m) => <Bubble key={m.id} role={m.role} content={m.content} />)}
          {pending && (
            <>
              <Bubble role="user" content={pending.user} />
              {pending.reply ? (
                <Bubble role="assistant" content={pending.reply} testId="chat-streaming-reply" />
              ) : (
                <div className="flex items-center gap-2 text-sm text-[#C4B5FD]" data-testid="chat-thinking">
                  <Loader2 className="size-4 animate-spin" /> Dame Morgane réfléchit…
                </div>
              )}
            </>
          )}
          <div ref={bottom} />
        </div>
        <form
          className="flex gap-3 border-t border-[#8B5CF6]/20 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
        >
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(text);
              }
            }}
            placeholder="Écris ta question…"
            className="min-h-12 resize-none bg-[#0D0B18]"
            data-testid="chat-input"
          />
          <Button type="submit" size="lg" disabled={ask.isPending || !text.trim()} data-testid="chat-send-button" className="self-end">
            {ask.isPending ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </form>
      </section>
    </div>
  );
}

function Bubble({ role, content, testId }: { role: "user" | "assistant"; content: string; testId?: string }) {
  const mine = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${mine ? "justify-end" : "justify-start"}`}
      data-testid={testId ?? `chat-message-${role}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap ${
          mine ? "rounded-br-sm bg-[#F59E0B] text-[#1A1202]" : "rounded-bl-sm border border-[#8B5CF6]/30 bg-[#221B3D] text-[#F5F3FF]"
        }`}
      >
        {content.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={i} className={mine ? "" : "text-[#FDE68A]"}>{part.slice(2, -2)}</strong>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </div>
    </motion.div>
  );
}
