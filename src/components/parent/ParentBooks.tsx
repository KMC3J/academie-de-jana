import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookPlus, Pencil, Trash2 } from "lucide-react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { useSubjects } from "@/lib/academy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fieldLabel, panel, useParentMutation } from "./common";
import type { Ok } from "@/lib/types";
import type { Book, BookChapter, BookKind, BookQuestion } from "@/data/library";
import { BOOK_KIND_LABEL } from "@/data/library";

// Champs en texte simple : un chapitre par ligne « Titre | paragraphe ; paragraphe »,
// une question par ligne « Question | bonne réponse | mauvaise 1 | mauvaise 2 | mauvaise 3 | explication ».
const chaptersToText = (c: BookChapter[]) => c.map((x) => `${x.title} | ${x.text.join(" ; ")}`).join("\n");
const textToChapters = (t: string): BookChapter[] =>
  t.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [title, rest = ""] = l.split(/\s*\|\s*(.*)/s);
    return { title: title.trim(), text: rest.split(";").map((p) => p.trim()).filter(Boolean) };
  });

const questionsToText = (q: BookQuestion[]) =>
  q.map((x) => [x.q, x.answer, ...x.options.filter((o) => o !== x.answer)].join(" | ")).join("\n");
const textToQuestions = (t: string): BookQuestion[] =>
  t.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [q, answer, ...rest] = l.split("|").map((s) => s.trim());
    return { q, answer, options: [answer, ...rest.filter(Boolean)] };
  });

export default function ParentBooks() {
  const { data: subjects } = useSubjects();
  const { data: books } = useQuery({ queryKey: ["books"], queryFn: () => apiGet<Book[]>("/books") });
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Book | null>(null);
  const [chapText, setChapText] = useState("");
  const [questText, setQuestText] = useState("");

  const empty = (): Book => ({
    id: "",
    subject_id: subjects?.[0]?.id ?? "francais",
    title: "",
    author: "Ajouté par la famille",
    kind: "roman",
    summary: "",
    minutes: 4,
    chapters: [],
    questions: [],
  });
  const f = form ?? empty();

  const save = useParentMutation(
    (b: Book) =>
      editing
        ? apiPut<Book>(`/books/${editing}`, { ...b, chapters: textToChapters(chapText), questions: textToQuestions(questText) })
        : apiPost<Book>("/books", { ...b, chapters: textToChapters(chapText), questions: textToQuestions(questText) }),
    [["books"]],
    editing ? "Livre modifié" : "Livre ajouté à la Bibliothèque",
    () => reset(),
  );
  const del = useParentMutation((id: string) => apiDelete<Ok>(`/books/${id}`), [["books"]], "Livre supprimé");

  const reset = () => {
    setForm(null);
    setEditing(null);
    setChapText("");
    setQuestText("");
  };
  const valid = f.title.trim().length > 0 && textToChapters(chapText).length > 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-[#86EFAC]">La Bibliothèque</h2>
          <Button size="sm" variant="outline" onClick={() => { reset(); setForm(empty()); }} data-testid="parent-book-new">
            <BookPlus /> Nouveau
          </Button>
        </div>
        <ul className="mt-3 space-y-1" data-testid="parent-book-list">
          {books?.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => {
                  setEditing(b.id);
                  setForm(b);
                  setChapText(chaptersToText(b.chapters));
                  setQuestText(questionsToText(b.questions));
                }}
                data-testid={`parent-book-${b.id}`}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-[background-color] ${
                  editing === b.id ? "bg-[#38BDF8]/20 text-white" : "text-[#C7D2FE] hover:bg-white/5"
                }`}
              >
                <span className="block font-semibold">{b.title}</span>
                <span className="text-xs text-[#93A4C4]">{BOOK_KIND_LABEL[b.kind]} · {b.minutes} min</span>
              </button>
            </li>
          ))}
          {books && books.length === 0 && <li className="text-sm text-[#93A4C4]">Aucun livre pour l'instant.</li>}
        </ul>
      </div>

      <form
        className={panel}
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) save.mutate(f);
        }}
        data-testid="parent-book-form"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-white">{editing ? "Modifier le livre" : "Ajouter un livre"}</h3>
          {editing && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              data-testid="parent-book-delete"
              onClick={() => { del.mutate(editing); reset(); }}
            >
              <Trash2 /> Supprimer
            </Button>
          )}
        </div>

        <label className={fieldLabel + " mt-3"}>Titre</label>
        <Input value={f.title} onChange={(e) => setForm({ ...f, title: e.target.value })} placeholder="Ex : Le secret du phare" data-testid="parent-book-title" />

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label className={fieldLabel}>Matière</label>
            <Select value={f.subject_id} onValueChange={(v: string) => setForm({ ...f, subject_id: v })}>
              <SelectTrigger className="w-full" data-testid="parent-book-subject"><SelectValue /></SelectTrigger>
              <SelectContent>
                {subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className={fieldLabel}>Genre</label>
            <Select value={f.kind} onValueChange={(v: string) => setForm({ ...f, kind: v as BookKind })}>
              <SelectTrigger className="w-full" data-testid="parent-book-kind"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(BOOK_KIND_LABEL) as BookKind[]).map((k) => (
                  <SelectItem key={k} value={k}>{BOOK_KIND_LABEL[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className={fieldLabel}>Durée (min)</label>
            <Input
              type="number"
              min={1}
              max={60}
              value={f.minutes}
              onChange={(e) => setForm({ ...f, minutes: Number(e.target.value) || 1 })}
              data-testid="parent-book-minutes"
            />
          </div>
        </div>

        <label className={fieldLabel + " mt-3"}>Résumé (une phrase)</label>
        <Input value={f.summary} onChange={(e) => setForm({ ...f, summary: e.target.value })} data-testid="parent-book-summary" />

        <label className={fieldLabel + " mt-3"}>
          Chapitres — une ligne par chapitre : <code>Titre | paragraphe ; paragraphe</code>
        </label>
        <Textarea
          rows={8}
          value={chapText}
          onChange={(e) => setChapText(e.target.value)}
          placeholder={"1. Le phare | Ce soir-là, la mer était noire. ; Anna monta les escaliers. | La lampe s'éteignit."}
          data-testid="parent-book-chapters"
        />

        <label className={fieldLabel + " mt-3"}>
          Questions — une ligne par question : <code>Question | bonne réponse | mauvaise 1 | mauvaise 2 | mauvaise 3</code>
        </label>
        <Textarea
          rows={4}
          value={questText}
          onChange={(e) => setQuestText(e.target.value)}
          placeholder={"Pourquoi Anna monte-t-elle au phare ? | Pour rallumer la lampe | Pour dormir | Pour pêcher | Pour appeler | La lampe s'est éteinte."}
          data-testid="parent-book-questions"
        />

        <div className="mt-4 flex gap-2">
          <Button type="submit" disabled={!valid} data-testid="parent-book-save">
            <Pencil /> {editing ? "Enregistrer" : "Ajouter"}
          </Button>
          {form && <Button type="button" variant="ghost" onClick={reset}>Annuler</Button>}
        </div>
      </form>
    </div>
  );
}
