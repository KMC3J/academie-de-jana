import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Gem, KeyRound, LockKeyhole, ShieldCheck, Sparkles, Star } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { formatDuration, useSubjects } from "@/lib/academy";
import { AvatarBadge } from "@/components/MagicIcon";
import PinDialog from "@/components/PinDialog";
import { ScreenTimeView } from "@/pages/TempsEcran";
import ParentChildren from "@/components/parent/ParentChildren";
import ParentSubjects from "@/components/parent/ParentSubjects";
import ParentQuests from "@/components/parent/ParentQuests";
import ParentSheets from "@/components/parent/ParentSheets";
import ParentTimetable from "@/components/parent/ParentTimetable";
import ParentBooks from "@/components/parent/ParentBooks";
import { fieldLabel, panel, useParentMutation } from "@/components/parent/common";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChildStats, Ok, ParentStatus } from "@/lib/types";

function ParentStatsView() {
  const { data: subjects } = useSubjects();
  const { data: stats } = useQuery({ queryKey: ["parent-stats"], queryFn: () => apiGet<ChildStats[]>("/parent/stats") });
  return (
    <div className="space-y-6">
      {stats?.map((c) => (
        <div key={c.profile.id} className="space-y-4" data-testid={`parent-stats-${c.profile.id}`}>
          <div className={`${panel} flex flex-wrap items-center gap-5`}>
            <AvatarBadge icon={c.profile.avatar.icon} color={c.profile.avatar.color} size={56} />
            <div className="flex-1">
              <p className="font-heading text-2xl font-bold text-white">{c.profile.name}</p>
              <p className="text-sm text-[#86EFAC]">{c.profile.level_title} · niveau {c.profile.level} · {c.profile.badges.length} badges</p>
            </div>
            {[
              { l: "XP", v: c.profile.xp, i: <Sparkles className="size-4 text-[#FDE68A]" /> },
              { l: "Étoiles", v: c.profile.stars, i: <Star className="size-4 text-[#FBBF24]" /> },
              { l: "Cristaux", v: c.profile.crystals, i: <Gem className="size-4 text-[#C4B5FD]" /> },
              { l: "Quiz faits", v: c.quizzes_count, i: null },
              { l: "Réussite moy.", v: `${c.avg_score}%`, i: null },
              { l: "Créations", v: c.creations_count, i: null },
              { l: "Aujourd'hui", v: formatDuration(c.screen_days[c.screen_days.length - 1]?.total_seconds ?? 0), i: null },
            ].map((s) => (
              <div key={s.l} className="min-w-20 rounded-2xl bg-white/5 px-3 py-2 text-center">
                <p className="flex items-center justify-center gap-1 font-mono text-lg text-white">{s.i}{s.v}</p>
                <p className="text-[11px] text-[#86EFAC]">{s.l}</p>
              </div>
            ))}
          </div>
          <ScreenTimeView days={c.screen_days} subjects={subjects} />
        </div>
      ))}
    </div>
  );
}

function ParentPinForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const change = useParentMutation(
    (b: { current_pin: string; new_pin: string }) => apiPost<Ok>("/parent/pin", b),
    [], "Code parent modifié", () => { setCurrent(""); setNext(""); },
  );
  const valid = current.length >= 4 && /^\d{4,8}$/.test(next);
  return (
    <form className={`${panel} max-w-md`} onSubmit={(e) => { e.preventDefault(); if (valid) change.mutate({ current_pin: current, new_pin: next }); }}>
      <h3 className="flex items-center gap-2 font-heading text-xl font-bold text-white"><KeyRound className="size-5 text-[#38BDF8]" /> Changer le code parent</h3>
      <label className={`${fieldLabel} mt-4`}>Code actuel</label>
      <Input type="password" inputMode="numeric" value={current} onChange={(e) => setCurrent(e.target.value)} data-testid="parent-current-pin-input" />
      <label className={`${fieldLabel} mt-3`}>Nouveau code (4 à 8 chiffres)</label>
      <Input type="password" inputMode="numeric" value={next} onChange={(e) => setNext(e.target.value)} data-testid="parent-new-pin-input" />
      <Button type="submit" className="mt-4" disabled={!valid || change.isPending} data-testid="parent-change-pin-button">Enregistrer</Button>
    </form>
  );
}

export default function Parent() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: status, isLoading } = useQuery({ queryKey: ["parent-status"], queryFn: () => apiGet<ParentStatus>("/parent/status") });
  const lock = useMutation({
    mutationFn: () => apiPost<Ok>("/parent/lock"),
    onSuccess: () => {
      qc.removeQueries({ queryKey: ["parent-stats"] });
      qc.invalidateQueries({ queryKey: ["parent-status"] });
      navigate("/");
    },
  });
  const unlocked = status?.unlocked === true;

  return (
    <div className="min-h-screen bg-[#0B141D]">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#38BDF8]/20 bg-[#0B141D]/85 px-6 py-4 backdrop-blur-xl">
        <Link to="/" className="text-[#BAE6FD] hover:text-white" aria-label="Retour" data-testid="parent-back-link"><ArrowLeft className="size-5" /></Link>
        <ShieldCheck className="size-5 text-[#38BDF8]" />
        <h1 className="flex-1 font-heading text-2xl font-bold text-white">Espace parent</h1>
        {unlocked && (
          <Button variant="outline" size="sm" onClick={() => lock.mutate()} data-testid="parent-lock-button">
            <LockKeyhole /> Verrouiller
          </Button>
        )}
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        {!unlocked && !isLoading && (
          <div className={`${panel} mx-auto max-w-md text-center`} data-testid="parent-locked">
            <LockKeyhole className="mx-auto size-10 text-[#38BDF8]" />
            <p className="mt-3 text-white">Cet espace est protégé par le code parent.</p>
            <ParentGate />
          </div>
        )}
        {unlocked && (
          <Tabs defaultValue="suivi">
            <TabsList className="flex-wrap" data-testid="parent-tabs">
              <TabsTrigger value="suivi" data-testid="parent-tab-suivi">Suivi</TabsTrigger>
              <TabsTrigger value="enfants" data-testid="parent-tab-enfants">Enfants</TabsTrigger>
              <TabsTrigger value="matieres" data-testid="parent-tab-matieres">Matières & chapitres</TabsTrigger>
              <TabsTrigger value="quetes" data-testid="parent-tab-quetes">Quêtes</TabsTrigger>
              <TabsTrigger value="fiches" data-testid="parent-tab-fiches">Fiches & cartes</TabsTrigger>
              <TabsTrigger value="livres" data-testid="parent-tab-livres">Bibliothèque</TabsTrigger>
              <TabsTrigger value="edt" data-testid="parent-tab-edt">Emploi du temps</TabsTrigger>
              <TabsTrigger value="code" data-testid="parent-tab-code">Code parent</TabsTrigger>
            </TabsList>
            <TabsContent value="suivi" className="mt-6"><ParentStatsView /></TabsContent>
            <TabsContent value="enfants" className="mt-6"><ParentChildren /></TabsContent>
            <TabsContent value="matieres" className="mt-6"><ParentSubjects /></TabsContent>
            <TabsContent value="quetes" className="mt-6"><ParentQuests /></TabsContent>
            <TabsContent value="fiches" className="mt-6"><ParentSheets /></TabsContent>
            <TabsContent value="livres" className="mt-6"><ParentBooks /></TabsContent>
            <TabsContent value="edt" className="mt-6"><ParentTimetable /></TabsContent>
            <TabsContent value="code" className="mt-6"><ParentPinForm /></TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

function ParentGate() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className="mt-4" onClick={() => setOpen(true)} data-testid="parent-enter-pin-button">Saisir le code</Button>
      <PinDialog open={open} onOpenChange={setOpen} onUnlocked={() => setOpen(false)} />
    </>
  );
}
