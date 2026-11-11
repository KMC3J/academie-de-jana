import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { apiDelete, apiPost, apiPut } from "@/lib/api";
import { useSubjects } from "@/lib/academy";
import { MagicIcon, SUBJECT_ICON_NAMES } from "@/components/MagicIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fieldLabel, panel, useParentMutation } from "./common";
import type { ChapterIn, Ok, Subject, SubjectIn } from "@/lib/types";

const KEYS = [["subjects"], ["subject"]];
const EMPTY: SubjectIn = { name: "", magic_name: "", icon: "book", color: "#8B5CF6", order: 99 };

export default function ParentSubjects() {
  const { data: subjects } = useSubjects();
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState<SubjectIn>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [chapter, setChapter] = useState<ChapterIn>({ title: "", description: "" });
  const [chapterEdit, setChapterEdit] = useState<string | null>(null);
  const current = subjects?.find((s) => s.id === selected) ?? subjects?.[0];

  const saveSubject = useParentMutation(
    (b: SubjectIn) => (editing ? apiPut<Subject>(`/subjects/${editing}`, b) : apiPost<Subject>("/subjects", b)),
    KEYS, "Matière enregistrée",
    (s) => { setForm(EMPTY); setEditing(null); setSelected(s.id); },
  );
  const delSubject = useParentMutation((id: string) => apiDelete<Ok>(`/subjects/${id}`), KEYS, "Matière supprimée", () => setSelected(null));
  const saveChapter = useParentMutation(
    (b: ChapterIn) =>
      chapterEdit
        ? apiPut<Subject>(`/subjects/${current?.id}/chapters/${chapterEdit}`, b)
        : apiPost<Subject>(`/subjects/${current?.id}/chapters`, b),
    KEYS, "Chapitre enregistré",
    () => { setChapter({ title: "", description: "" }); setChapterEdit(null); },
  );
  const delChapter = useParentMutation((cid: string) => apiDelete<Subject>(`/subjects/${current?.id}/chapters/${cid}`), KEYS, "Chapitre supprimé");

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <div className="space-y-5">
        <div className={panel}>
          <h3 className="font-heading text-xl font-bold text-white">Matières</h3>
          <ul className="mt-3 space-y-1" data-testid="parent-subject-list">
            {subjects?.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => setSelected(s.id)} data-testid={`parent-subject-${s.id}`}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${current?.id === s.id ? "bg-[#38BDF8]/15 text-white" : "text-[#D1FAE5] hover:bg-white/5"}`}>
                  <span style={{ color: s.color }}><MagicIcon name={s.icon} className="size-4" /></span>
                  <span className="flex-1">{s.name}</span>
                  <span className="font-mono text-xs text-[#86EFAC]">{s.chapters.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <form className={panel} onSubmit={(e) => { e.preventDefault(); if (form.name.trim()) saveSubject.mutate(form); }}>
          <h3 className="font-heading text-lg font-bold text-white">{editing ? "Modifier la matière" : "Nouvelle matière"}</h3>
          <label className={`${fieldLabel} mt-3`}>Nom</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="parent-subject-name-input" />
          <label className={`${fieldLabel} mt-3`}>Nom magique</label>
          <Input value={form.magic_name} onChange={(e) => setForm({ ...form, magic_name: e.target.value })} placeholder="Ex : Arithmomancie" data-testid="parent-subject-magic-input" />
          <label className={`${fieldLabel} mt-3`}>Icône et couleur</label>
          <div className="flex flex-wrap gap-1.5">
            {SUBJECT_ICON_NAMES.map((n) => (
              <button key={n} type="button" onClick={() => setForm({ ...form, icon: n })}
                className={`flex size-8 items-center justify-center rounded-lg ${form.icon === n ? "bg-[#38BDF8] text-[#06202E]" : "bg-white/5 text-white"}`}>
                <MagicIcon name={n} className="size-4" />
              </button>
            ))}
          </div>
          <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="mt-2 h-9 w-16 cursor-pointer rounded bg-transparent" data-testid="parent-subject-color-input" />
          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={!form.name.trim()} data-testid="parent-subject-save-button"><Plus /> {editing ? "Enregistrer" : "Ajouter"}</Button>
            {editing && <Button type="button" variant="ghost" onClick={() => { setEditing(null); setForm(EMPTY); }}>Annuler</Button>}
          </div>
        </form>
      </div>

      {current && (
        <div className={panel}>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="flex-1 font-heading text-2xl font-bold text-white" data-testid="parent-current-subject">{current.name}</h3>
            <Button variant="outline" size="sm" data-testid="parent-subject-edit-button"
              onClick={() => { setEditing(current.id); setForm({ name: current.name, magic_name: current.magic_name, icon: current.icon, color: current.color, order: current.order }); }}>
              <Pencil /> Modifier
            </Button>
            <Button variant="destructive" size="sm" data-testid="parent-subject-delete-button"
              onClick={() => window.confirm(`Supprimer la matière ${current.name} ?`) && delSubject.mutate(current.id)}>
              <Trash2 /> Supprimer
            </Button>
          </div>
          <h4 className="mt-5 text-sm font-semibold text-[#86EFAC]">Chapitres (utilisés par l'IA pour créer les quiz)</h4>
          <ul className="mt-2 space-y-2" data-testid="parent-chapter-list">
            {current.chapters.map((c) => (
              <li key={c.id} className="flex items-start gap-3 rounded-2xl bg-white/5 p-3">
                <div className="flex-1">
                  <p className="font-semibold text-white">{c.title}</p>
                  <p className="text-sm text-[#A7F3D0]/70">{c.description}</p>
                </div>
                <Button variant="ghost" size="icon-sm" aria-label="Modifier" onClick={() => { setChapterEdit(c.id); setChapter({ title: c.title, description: c.description }); }} data-testid={`parent-chapter-edit-${c.id}`}><Pencil /></Button>
                <Button variant="ghost" size="icon-sm" aria-label="Supprimer" onClick={() => delChapter.mutate(c.id)} data-testid={`parent-chapter-delete-${c.id}`}><Trash2 /></Button>
              </li>
            ))}
          </ul>
          <form className="mt-4 grid gap-2 rounded-2xl border border-dashed border-[#38BDF8]/30 p-4" onSubmit={(e) => { e.preventDefault(); if (chapter.title.trim()) saveChapter.mutate(chapter); }}>
            <label className={fieldLabel}>{chapterEdit ? "Modifier le chapitre" : "Ajouter un chapitre"}</label>
            <Input value={chapter.title} onChange={(e) => setChapter({ ...chapter, title: e.target.value })} placeholder="Titre du chapitre" data-testid="parent-chapter-title-input" />
            <Input value={chapter.description} onChange={(e) => setChapter({ ...chapter, description: e.target.value })} placeholder="Notions à travailler (aide l'IA)" data-testid="parent-chapter-desc-input" />
            <div className="flex gap-2">
              <Button type="submit" disabled={!chapter.title.trim()} data-testid="parent-chapter-save-button"><Plus /> {chapterEdit ? "Enregistrer" : "Ajouter le chapitre"}</Button>
              {chapterEdit && <Button type="button" variant="ghost" onClick={() => { setChapterEdit(null); setChapter({ title: "", description: "" }); }}>Annuler</Button>}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
