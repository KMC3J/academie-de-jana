import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, Map, Play, Star, Trophy } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { useProfile, useProfileId, useSubjects } from "@/lib/academy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Profile, Quest, QuestAnswerOut } from "@/lib/types";

function QuestCard({ quest, done, started, onOpen }: { quest: Quest; done: number; started: boolean; onOpen: () => void }) {
  const { data: subjects } = useSubjects();
  const subj = subjects?.find((s) => s.id === quest.subject_id);
  const total = quest.steps.length;
  const finished = started && done >= total;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col rounded-3xl border border-[#F59E0B]/25 bg-gradient-to-b from-[#221B3D] to-[#18142A] p-6"
      data-testid={`quest-card-${quest.id}`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: subj?.color ?? "#FDE68A" }}>
        <Map className="size-4" /> {subj?.name ?? "Quête libre"}
      </div>
      <h3 className="mt-2 font-heading text-2xl font-bold text-white">{quest.title}</h3>
      <p className="mt-1 text-sm text-[#A7A1C8]">{quest.description}</p>
      <div className="mt-4 flex gap-1.5">
        {quest.steps.map((_, i) => (
          <span key={i} className={`h-2 flex-1 rounded-full ${i < done ? "bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]" : "bg-white/10"}`} />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-xs text-[#C4B5FD]">
          {done}/{total} étapes
        </span>
        <span className="flex items-center gap-1 font-mono text-sm text-[#FBBF24]">
          <Star className="size-4 fill-current" /> {quest.reward_stars}
        </span>
      </div>
      <Button
        className="mt-4"
        variant={finished ? "secondary" : "default"}
        onClick={onOpen}
        data-testid={`quest-open-button-${quest.id}`}
      >
        {finished ? <Trophy /> : <Play />}
        {finished ? "Revoir" : started ? "Continuer" : "Commencer"}
      </Button>
    </motion.div>
  );
}

export default function Quetes() {
  const profileId = useProfileId();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const { data: quests, isError } = useQuery({ queryKey: ["quests"], queryFn: () => apiGet<Quest[]>("/quests") });
  const [openId, setOpenId] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);

  const progress = profile?.quest_progress ?? {};
  const isStarted = (q: Quest) => q.id in progress;
  const doneOf = (q: Quest) => progress[q.id] ?? 0;
  const enCours = quests?.filter((q) => isStarted(q) && doneOf(q) < q.steps.length) ?? [];
  const aVenir = quests?.filter((q) => !isStarted(q)) ?? [];
  const finies = quests?.filter((q) => isStarted(q) && doneOf(q) >= q.steps.length) ?? [];
  const open = quests?.find((q) => q.id === openId);

  const setProfile = (p: Profile) => qc.setQueryData(["profile", profileId], p);

  const start = useMutation({
    mutationFn: (id: string) => apiPost<Profile>(`/profiles/${profileId}/quests/${id}/start`),
    onSuccess: setProfile,
  });
  const send = useMutation({
    mutationFn: (id: string) => apiPost<QuestAnswerOut>(`/profiles/${profileId}/quests/${id}/answer`, { answer }),
    onSuccess: (r) => {
      setProfile(r.profile);
      if (!r.correct) {
        setWrong(true);
        return;
      }
      setWrong(false);
      setAnswer("");
      if (r.completed) toast.success("Quête accomplie ! Les étoiles sont à toi.");
      else toast.success("Étape réussie ! +15 XP");
    },
  });

  const openQuest = (q: Quest) => {
    setOpenId(q.id);
    setAnswer("");
    setWrong(false);
    if (!isStarted(q)) start.mutate(q.id);
  };

  const renderList = (list: Quest[], empty: string) => (
    <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {list.map((q) => (
        <QuestCard key={q.id} quest={q} done={doneOf(q)} started={isStarted(q)} onOpen={() => openQuest(q)} />
      ))}
      {list.length === 0 && <p className="text-sm text-[#A7A1C8]">{empty}</p>}
    </div>
  );

  const step = open ? open.steps[doneOf(open)] : undefined;
  const openFinished = open ? doneOf(open) >= open.steps.length : false;

  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-[#FDE68A] uppercase">La salle des quêtes</p>
      <h1 className="mt-1 font-heading text-4xl font-bold text-white">Tes quêtes</h1>
      <p className="mt-2 text-[#A7A1C8]">Résous chaque énigme pour avancer et gagner des étoiles.</p>
      {isError && <p className="mt-4 text-sm text-[#C084FC]">Les quêtes apparaîtront dès que le château se réveille.</p>}
      <Tabs defaultValue="en-cours" className="mt-6">
        <TabsList data-testid="quest-tabs">
          <TabsTrigger value="en-cours" data-testid="quest-tab-en-cours">En cours ({enCours.length})</TabsTrigger>
          <TabsTrigger value="a-venir" data-testid="quest-tab-a-venir">À venir ({aVenir.length})</TabsTrigger>
          <TabsTrigger value="terminees" data-testid="quest-tab-terminees">Terminées ({finies.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="en-cours">{renderList(enCours, "Aucune quête en cours : choisis-en une dans « À venir ».")}</TabsContent>
        <TabsContent value="a-venir">{renderList(aVenir, "Toutes les quêtes ont commencé !")}</TabsContent>
        <TabsContent value="terminees">{renderList(finies, "Pas encore de quête terminée.")}</TabsContent>
      </Tabs>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="border-[#F59E0B]/30 bg-[#18142A] sm:max-w-lg" data-testid="quest-dialog">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl text-white">{open.title}</DialogTitle>
                <DialogDescription className="text-[#C4B5FD]">
                  Étape {Math.min(doneOf(open) + 1, open.steps.length)} sur {open.steps.length}
                </DialogDescription>
              </DialogHeader>
              <ol className="space-y-1.5">
                {open.steps.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    {i < doneOf(open) ? (
                      <CheckCircle2 className="size-4 text-[#34D399]" />
                    ) : i === doneOf(open) ? (
                      <Star className="size-4 text-[#F59E0B]" />
                    ) : (
                      <Lock className="size-4 text-white/30" />
                    )}
                    <span className={i <= doneOf(open) ? "text-white" : "text-white/40"}>{s.title}</span>
                  </li>
                ))}
              </ol>
              {openFinished ? (
                <div className="rounded-2xl bg-[#F59E0B]/10 p-5 text-center" data-testid="quest-completed">
                  <Trophy className="mx-auto size-10 text-[#F59E0B]" />
                  <p className="mt-2 font-heading text-xl text-white">Quête accomplie !</p>
                  <p className="text-sm text-[#FDE68A]">+{open.reward_stars} étoiles gagnées</p>
                </div>
              ) : (
                step && (
                  <form
                    className="rounded-2xl border border-[#8B5CF6]/30 bg-[#221B3D] p-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      send.mutate(open.id);
                    }}
                  >
                    <p className="text-white" data-testid="quest-step-question">{step.question || step.title}</p>
                    {step.answer ? (
                      <Input
                        className="mt-3 bg-[#0D0B18]"
                        placeholder="Ta réponse"
                        value={answer}
                        onChange={(e) => {
                          setAnswer(e.target.value);
                          setWrong(false);
                        }}
                        data-testid="quest-answer-input"
                      />
                    ) : null}
                    {wrong && (
                      <p className="mt-2 text-sm text-[#FCA5A5]" data-testid="quest-wrong-answer">
                        Pas tout à fait… Relis bien l'énigme et réessaie !
                      </p>
                    )}
                    <Button type="submit" className="mt-3" disabled={send.isPending || (!!step.answer && !answer.trim())} data-testid="quest-answer-submit">
                      {step.answer ? "Valider" : "Étape accomplie"}
                    </Button>
                  </form>
                )
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
