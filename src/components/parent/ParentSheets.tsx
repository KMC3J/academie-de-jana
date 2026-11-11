import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { useSubjects } from "@/lib/academy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fieldLabel, panel, useParentMutation } from "./common";
import type { MindBranch, Ok, Sheet, SheetIn, SheetKind } from "@/lib/types";

// Mind-map branches are edited as plain text: one line per branch, "Branche : élément ; élément".
const branchesToText = (b: MindBranch[]) => b.map((x) => `${x.label} : ${x.items.join(" ; ")}`).join("\n");
const textToBranches = (t: string): MindBranch[] =>
  t.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [label, rest = ""] = l.split(/\s*:\s*(.*)/s);
    return { label: label.trim(), items: rest.split(";").map((s) => s.trim()).filter(Boolean) };
  });

export default function ParentSheets() {
  const { data: subjects } = useSubjects();
  const { data: sheets } = useQuery({ queryKey: ["sheets", "all"], queryFn: () => apiGet<Sheet[]>("/sheets") });
  const empty = (): SheetIn => ({ subject_id: subjects?.[0]?.id ?? "", kind: "methode", title: "", content: "", branches: [] });
  const [form, setForm] = useState<SheetIn | null>(null);
  const [branchText, setBranchText] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const f = form ?? empty();
  const reset = () => { setForm(null); setBranchText(""); setEditing(null); };
  const save = useParentMutation(
    (b: SheetIn) => (editing ? apiPut<Sheet>(`/sheets/${editing}`, b) : apiPost<Sheet>("/sheets", b)),
    [["sheets"]], "Fiche enregistrée", reset,
  );
  const del = useParentMutation((id: string) => apiDelete<Ok>(`/sheets/${id}`), [["sheets"]], "Fiche supprimée");
  const subjName = (id: string) => subjects?.find((s) => s.id === id)?.name ?? "Matière";
  const valid = f.title.trim() && f.subject_id;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <div className={panel}>
        <h3 className="font-heading text-xl font-bold text-white">Fiches méthodes & cartes mentales</h3>
        <ul className="mt-3 space-y-2" data-testid="parent-sheet-list">
          {sheets?.map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
              <div className="flex-1">
                <p className="font-semibold text-white">{s.title}</p>
                <p className="text-xs text-[#86EFAC]">{subjName(s.subject_id)} · {s.kind === "carte" ? "Carte mentale" : "Méthode"}</p>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Modifier" data-testid={`parent-sheet-edit-${s.id}`}
                onClick={() => { setEditing(s.id); setForm({ subject_id: s.subject_id, kind: s.kind, title: s.title, content: s.content, branches: s.branches }); setBranchText(branchesToText(s.branches)); }}>
                <Pencil />
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label="Supprimer" data-testid={`parent-sheet-delete-${s.id}`}
                onClick={() => window.confirm(`Supprimer « ${s.title} » ?`) && del.mutate(s.id)}>
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <form className={panel} onSubmit={(e) => { e.preventDefault(); if (valid) save.mutate({ ...f, branches: f.kind === "carte" ? textToBranches(branchText) : [] }); }}>
        <h3 className="font-heading text-xl font-bold text-white">{editing ? "Modifier la fiche" : "Nouvelle fiche"}</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={fieldLabel}>Matière</label>
            <Select value={f.subject_id} onValueChange={(v: string) => setForm({ ...f, subject_id: v })}>
              <SelectTrigger className="w-full" data-testid="parent-sheet-subject-select"><SelectValue>{(v: unknown) => subjName(v as string)}</SelectValue></SelectTrigger>
              <SelectContent>{subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className={fieldLabel}>Type</label>
            <Select value={f.kind} onValueChange={(v: string) => setForm({ ...f, kind: v as SheetKind })}>
              <SelectTrigger className="w-full" data-testid="parent-sheet-kind-select"><SelectValue>{(v: unknown) => (v === "carte" ? "Carte mentale" : "Fiche méthode")}</SelectValue></SelectTrigger>
              <SelectContent>
                <SelectItem value="methode">Fiche méthode</SelectItem>
                <SelectItem value="carte">Carte mentale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <label className={`${fieldLabel} mt-3`}>Titre</label>
        <Input value={f.title} onChange={(e) => setForm({ ...f, title: e.target.value })} data-testid="parent-sheet-title-input" />
        <label className={`${fieldLabel} mt-3`}>{f.kind === "carte" ? "Idée centrale" : "Contenu de la fiche"}</label>
        {f.kind === "carte" ? (
          <Input value={f.content} onChange={(e) => setForm({ ...f, content: e.target.value })} data-testid="parent-sheet-content-input" />
        ) : (
          <Textarea className="min-h-48" value={f.content} onChange={(e) => setForm({ ...f, content: e.target.value })} data-testid="parent-sheet-content-input" />
        )}
        {f.kind === "carte" && (
          <>
            <label className={`${fieldLabel} mt-3`}>Branches — une par ligne : « Branche : élément ; élément »</label>
            <Textarea className="min-h-36 font-mono text-sm" value={branchText} onChange={(e) => setBranchText(e.target.value)}
              placeholder={"Vocabulaire : Numérateur ; Dénominateur\nSimplifier : Diviser haut et bas"} data-testid="parent-sheet-branches-input" />
          </>
        )}
        <div className="mt-5 flex gap-2">
          <Button type="submit" disabled={!valid || save.isPending} data-testid="parent-sheet-save-button">{editing ? "Enregistrer" : "Ajouter la fiche"}</Button>
          {editing && <Button type="button" variant="ghost" onClick={reset}>Annuler</Button>}
        </div>
      </form>
    </div>
  );
}
