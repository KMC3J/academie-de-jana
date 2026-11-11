import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { useSubjects } from "@/lib/academy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fieldLabel, panel, useParentMutation } from "./common";
import type { Ok, Quest, QuestIn } from "@/lib/types";

const EMPTY: QuestIn = { title: "", description: "", subject_id: null, steps: [{ title: "", question: "", answer: "" }], reward_stars: 10 };

export default function ParentQuests() {
  const { data: subjects } = useSubjects();
  const { data: quests } = useQuery({ queryKey: ["quests"], queryFn: () => apiGet<Quest[]>("/quests") });
  const [form, setForm] = useState<QuestIn>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const reset = () => { setForm(EMPTY); setEditing(null); };
  const save = useParentMutation(
    (b: QuestIn) => (editing ? apiPut<Quest>(`/quests/${editing}`, b) : apiPost<Quest>("/quests", b)),
    [["quests"]], "Quête enregistrée", reset,
  );
  const del = useParentMutation((id: string) => apiDelete<Ok>(`/quests/${id}`), [["quests"]], "Quête supprimée");
  const setStep = (i: number, k: keyof QuestIn["steps"][number], v: string) =>
    setForm({ ...form, steps: form.steps.map((s, j) => (j === i ? { ...s, [k]: v } : s)) });
  const valid = form.title.trim() && form.steps.length > 0 && form.steps.every((s) => s.title.trim());
  const subjLabel = (v: string) => (v === "none" ? "Aucune (quête libre)" : subjects?.find((s) => s.id === v)?.name ?? "Matière");

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <div className={panel}>
        <h3 className="font-heading text-xl font-bold text-white">Quêtes</h3>
        <ul className="mt-3 space-y-2" data-testid="parent-quest-list">
          {quests?.map((q) => (
            <li key={q.id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
              <div className="flex-1">
                <p className="font-semibold text-white">{q.title}</p>
                <p className="text-xs text-[#86EFAC]">{q.steps.length} étapes · {q.reward_stars} étoiles · {subjects?.find((s) => s.id === q.subject_id)?.name ?? "libre"}</p>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Modifier" data-testid={`parent-quest-edit-${q.id}`}
                onClick={() => { setEditing(q.id); setForm({ title: q.title, description: q.description, subject_id: q.subject_id, steps: q.steps, reward_stars: q.reward_stars }); }}>
                <Pencil />
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label="Supprimer" data-testid={`parent-quest-delete-${q.id}`}
                onClick={() => window.confirm(`Supprimer « ${q.title} » ?`) && del.mutate(q.id)}>
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <form className={panel} onSubmit={(e) => { e.preventDefault(); if (valid) save.mutate(form); }}>
        <h3 className="font-heading text-xl font-bold text-white">{editing ? "Modifier la quête" : "Nouvelle quête"}</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
          <div>
            <label className={fieldLabel}>Titre</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="parent-quest-title-input" />
          </div>
          <div>
            <label className={fieldLabel}>Étoiles</label>
            <Input type="number" min={1} value={form.reward_stars} onChange={(e) => setForm({ ...form, reward_stars: Number(e.target.value) || 1 })} data-testid="parent-quest-stars-input" />
          </div>
        </div>
        <label className={`${fieldLabel} mt-3`}>Description</label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="parent-quest-desc-input" />
        <label className={`${fieldLabel} mt-3`}>Matière</label>
        <Select value={form.subject_id ?? "none"} onValueChange={(v: string) => setForm({ ...form, subject_id: v === "none" ? null : v })}>
          <SelectTrigger className="w-full" data-testid="parent-quest-subject-select"><SelectValue>{(v: unknown) => subjLabel(v as string)}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucune (quête libre)</SelectItem>
            {subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <p className={`${fieldLabel} mt-4`}>Étapes (laisse la réponse vide pour une étape à valider simplement)</p>
        <div className="space-y-2">
          {form.steps.map((s, i) => (
            <div key={i} className="grid gap-2 rounded-2xl bg-white/5 p-3 sm:grid-cols-[1fr_1.4fr_1fr_auto]">
              <Input placeholder={`Étape ${i + 1}`} value={s.title} onChange={(e) => setStep(i, "title", e.target.value)} data-testid={`parent-quest-step-title-${i}`} />
              <Input placeholder="Énigme / question" value={s.question} onChange={(e) => setStep(i, "question", e.target.value)} data-testid={`parent-quest-step-question-${i}`} />
              <Input placeholder="Réponse (a|b)" value={s.answer} onChange={(e) => setStep(i, "answer", e.target.value)} data-testid={`parent-quest-step-answer-${i}`} />
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Retirer" onClick={() => setForm({ ...form, steps: form.steps.filter((_, j) => j !== i) })}><X /></Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setForm({ ...form, steps: [...form.steps, { title: "", question: "", answer: "" }] })} data-testid="parent-quest-add-step">
          <Plus /> Ajouter une étape
        </Button>
        <div className="mt-5 flex gap-2">
          <Button type="submit" disabled={!valid || save.isPending} data-testid="parent-quest-save-button">{editing ? "Enregistrer" : "Créer la quête"}</Button>
          {editing && <Button type="button" variant="ghost" onClick={reset}>Annuler</Button>}
        </div>
      </form>
    </div>
  );
}
