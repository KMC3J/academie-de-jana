import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, FileText, Loader2, Network, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiPost, apiPut } from "@/lib/api";
import { useSubjects } from "@/lib/academy";
import type { Sheet } from "@/lib/types";
import { getAiConfig } from "@/lib/provider";
import {
  loadPhotos,
  savePhotos,
  newId,
  shrinkPhoto,
  transcribePhoto,
  mindMapFromText,
  pdfToText,
  cleanPdfText,
  type LessonPhoto,
} from "@/lib/cours";
import { Button } from "@/components/ui/button";

/**
 * « Mes cours » : Jana photographie son cahier, l'IA lit le cours, puis
 * Dame Morgane en fait une carte mentale rangée dans Fiches & cartes mentales.
 */
export default function MesCours() {
  const { data: subjects } = useSubjects();
  const qc = useQueryClient();
  const [photos, setPhotos] = useState<LessonPhoto[]>(() => loadPhotos());
  const [busy, setBusy] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const setErr = (id: string, text: string | null) =>
    setErrors((e) => {
      const next = { ...e };
      if (text) next[id] = text;
      else delete next[id];
      return next;
    });
  const fileRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const aiReady = getAiConfig().apiKey.trim().length > 0;

  // On écrit TOUJOURS à partir de la dernière liste (ref), jamais de la copie
  // capturée par le rendu : sinon, après l'ajout d'une photo, la mise à jour
  // « cours lu » écrasait la liste avec un ancien état et le bouton disparaissait.
  const photosRef = useRef<LessonPhoto[]>(photos);
  const persist = (next: LessonPhoto[]) => {
    photosRef.current = next;
    setPhotos(next);
    try {
      savePhotos(next);
    } catch (e) {
      setErrors((prev) => ({ ...prev, storage: String(e instanceof Error ? e.message : e) }));
    }
  };
  const patch = (id: string, changes: Partial<LessonPhoto>) =>
    persist(photosRef.current.map((p) => (p.id === id ? { ...p, ...changes } : p)));

  const createSheet = useMutation({
    mutationFn: (body: Omit<Sheet, "id">) => apiPost<Sheet>("/sheets", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sheets", "all"] }),
  });

  /** Devine la matière d'après le texte lu (ligne « MATIÈRE : … » ou mots-clés). */
  function guessSubject(text: string, fallback: string): string {
    const list = subjects ?? [];
    const tagged = /MATI[EÈ]RE\s*:\s*([^\n]+)/i.exec(text)?.[1]?.toLowerCase() ?? "";
    const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (const s of list) {
      if (tagged && norm(s.name).includes(norm(tagged.trim()).split(" ")[0])) return s.id;
    }
    const body = norm(text);
    const score = list
      .map((s) => ({ id: s.id, n: body.split(norm(s.name)).length - 1 }))
      .sort((a, b) => b.n - a.n)[0];
    return score && score.n > 0 ? score.id : fallback || list[0]?.id || "";
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!aiReady) {
      toast.error("Ajoute d'abord la clé Gemini dans le Professeur magique : c'est elle qui lit les photos.");
      return;
    }
    const fallbackSubject = subjectId || subjects?.[0]?.id || "";
    for (const file of Array.from(files)) {
      const id = newId();
      // ---- PDF : on lit d'abord le texte du document
      if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
        setBusy(id);
        const pdfDoc: LessonPhoto = {
          id,
          subject_id: fallbackSubject,
          title: file.name.replace(/\.pdf$/i, "") || "Cours en PDF",
          image: "",
          created_at: new Date().toISOString(),
          text: "",
          sheet_id: null,
          status: "à lire",
          doc: "pdf",
        };
        persist([pdfDoc, ...photosRef.current]);
        try {
          const { text, pages } = await pdfToText(file);
          if (!text.trim()) {
            // PDF scanné (photo de pages) : plus aucun texte à extraire.
            throw new Error(
              "Ce PDF ne contient que des images (document scanné) : fais-en une photo avec l'appareil photo.",
            );
          }
          const clean = await cleanPdfText(text);
          patch(id, { text: clean, status: "lu", pages, subject_id: guessSubject(clean, fallbackSubject) });
          toast.success(`PDF lu (${pages} page${pages > 1 ? "s" : ""}) : tu peux créer la carte mentale.`);
        } catch (e) {
          patch(id, { status: "erreur", error: String(e instanceof Error ? e.message : e).slice(0, 180) });
          toast.error("PDF illisible : " + String(e instanceof Error ? e.message : e).slice(0, 120));
        } finally {
          setBusy(null);
        }
        continue;
      }
      setBusy(id);
      let image = "";
      try {
        image = await shrinkPhoto(file);
      } catch (e) {
        toast.error(String(e));
        continue;
      }
      const base: LessonPhoto = {
        id,
        subject_id: fallbackSubject,
        title: file.name.replace(/\.[a-z]+$/i, "") || "Cours photographié",
        image,
        created_at: new Date().toISOString(),
        text: "",
        sheet_id: null,
        status: "à lire",
      };
      persist([base, ...photosRef.current]);
      try {
        const text = await transcribePhoto(image);
        const subj = guessSubject(text, fallbackSubject);
        patch(id, { text, status: "lu", subject_id: subj });
        toast.success("Cours lu ! Tu peux maintenant créer la carte mentale.");
      } catch (e) {
        patch(id, { status: "erreur", error: String(e instanceof Error ? e.message : e).slice(0, 160) });
        toast.error("Lecture impossible : " + String(e instanceof Error ? e.message : e).slice(0, 120));
      } finally {
        setBusy(null);
      }
    }
  }

  async function makeCard(photo: LessonPhoto) {
    setErr(photo.id, null);
    if (!photo.text) {
      const msg = "Le cours n'a pas encore été lu : attends la fin de la lecture.";
      setErr(photo.id, msg);
      toast.error(msg);
      return;
    }
    setBusy(photo.id);
    try {
      const map = await mindMapFromText(photo.text, subjects?.find((s) => s.id === photo.subject_id)?.name ?? "cours");
      const sheet = await createSheet.mutateAsync({
        subject_id: photo.subject_id,
        kind: "carte",
        title: map.title,
        content: map.title,
        branches: map.branches,
      });
      patch(photo.id, { sheet_id: sheet.id, title: map.title });
      toast.success("Carte mentale créée dans Fiches et cartes mentales !");
    } catch (e) {
      const text = String(e instanceof Error ? e.message : e).slice(0, 220);
      // L'erreur reste affichée sous le cours : un toast disparaît trop vite
      // pour qu'on sache pourquoi « rien ne se passe ».
      setErr(photo.id, text);
      toast.error("Carte mentale impossible : " + text.slice(0, 100));
    } finally {
      setBusy(null);
    }
  }

  async function retry(photo: LessonPhoto) {
    setBusy(photo.id);
    try {
      const text = await transcribePhoto(photo.image);
      patch(photo.id, { text, status: "lu", error: undefined, subject_id: guessSubject(text, photo.subject_id) });
    } catch (e) {
      patch(photo.id, { status: "erreur", error: String(e instanceof Error ? e.message : e).slice(0, 160) });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-[#FDE68A] uppercase">La Bibliothèque</p>
      <h1 className="mt-1 font-heading text-4xl font-bold text-white">Mes cours</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#A7A1C8]">
        Photographie ton cahier ou ajoute un PDF : Dame Morgane lit le cours, puis t'en fait une carte mentale
        rangée dans « Fiches et cartes mentales ».
      </p>

      {!aiReady && (
        <p className="mt-4 rounded-2xl border border-[#F59E0B]/40 bg-[#F59E0B]/10 p-4 text-sm text-[#FDE68A]" data-testid="cours-no-key">
          La lecture des photos a besoin de la clé Gemini : ouvre <strong>Professeur magique</strong> → « Cerveau de
          Dame Morgane » et colle ta clé gratuite.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-3xl border border-white/5 bg-[#18142A] p-4">
        <label className="text-xs text-[#A7A1C8]">
          Matière (si le cours ne le dit pas)
          <select
            className="mt-1 block rounded-lg border border-white/10 bg-[#0D0B18] px-3 py-2 text-sm text-white"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            data-testid="cours-subject"
          >
            <option value="">Détecter automatiquement</option>
            {subjects?.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          data-testid="cours-file"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button onClick={() => fileRef.current?.click()} data-testid="cours-pick">
          <Camera /> Photographier mon cahier
        </Button>
        <input
          ref={pdfRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          data-testid="cours-pdf-file"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button variant="outline" onClick={() => pdfRef.current?.click()} data-testid="cours-pdf">
          <FileText /> Ajouter un PDF
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {photos.map((p) => (
          <article key={p.id} className="rounded-3xl border border-white/5 bg-[#18142A] p-4" data-testid={`cours-item-${p.id}`}>
            <div className="flex gap-4">
              {p.image ? (
                <img src={p.image} alt={p.title} className="h-28 w-24 shrink-0 rounded-xl object-cover ring-1 ring-white/10" />
              ) : (
                <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-xl bg-[#0D0B18] ring-1 ring-white/10">
                  <FileText className="size-8 text-[#C4B5FD]" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#9D95C2]">
                  {subjects?.find((s) => s.id === p.subject_id)?.name ?? "Matière ?"} ·{" "}
                  {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  {p.doc === "pdf" ? ` · PDF${p.pages ? ` (${p.pages} p.)` : ""}` : ""}
                </p>
                <h2 className="truncate font-heading text-lg font-bold text-white">{p.title}</h2>
                <p className="mt-1 text-xs text-[#A7A1C8]">
                  {p.status === "lu" ? "Cours lu ✅" : p.status === "erreur" ? `Non lu : ${p.error ?? ""}` : "Lecture en cours…"}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => persist(photosRef.current.filter((x) => x.id !== p.id))}
                data-testid={`cours-delete-${p.id}`}
              >
                <Trash2 />
              </Button>
            </div>
            {p.text && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-[#C4B5FD]">Voir le cours transcrit</summary>
                <pre className="mt-2 max-h-52 overflow-auto rounded-xl bg-[#0D0B18] p-3 text-[12px] whitespace-pre-wrap text-[#EDE9FE]">
                  {p.text}
                </pre>
              </details>
            )}
            {errors[p.id] && (
              <p className="mt-3 rounded-xl border border-[#F87171]/40 bg-[#7F1D1D]/30 p-3 text-xs leading-relaxed text-[#FECACA]" data-testid={`cours-error-${p.id}`}>
                {errors[p.id]}
              </p>
            )}
            {busy === p.id && (
              <p className="mt-3 text-xs text-[#C4B5FD]" data-testid={`cours-working-${p.id}`}>
                Dame Morgane prépare la carte mentale… (jusqu'à 25 s)
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={busy === p.id || !p.text}
                onClick={() => makeCard(p)}
                data-testid={`cours-mindmap-${p.id}`}
              >
                {busy === p.id ? <Loader2 className="animate-spin" /> : <Network />}{" "}
                {p.sheet_id ? "Refaire la carte mentale" : "Créer la carte mentale"}
              </Button>
              {p.status === "erreur" && p.doc !== "pdf" && (
                <Button size="sm" variant="outline" onClick={() => retry(p)} disabled={busy === p.id}>
                  Relire la photo
                </Button>
              )}
              {p.sheet_id && (
                <a
                  href={`/fiches?sheet=${p.sheet_id}`}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[#FDE68A] underline"
                >
                  Voir la carte mentale →
                </a>
              )}
            </div>
          </article>
        ))}
        {photos.length === 0 && (
          <p className="text-sm text-[#A7A1C8]">Aucune photo pour l'instant : prends ton premier cours en photo !</p>
        )}
      </div>
    </div>
  );
}
