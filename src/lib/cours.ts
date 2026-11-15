/**
 * Mes cours : les photos du cahier de Jana.
 *
 * Une photo est rangée dans le navigateur (localStorage), lue par l'IA (Gemini
 * sait lire les images), puis transformée en carte mentale rangée dans
 * « Fiches & cartes mentales ». Si l'IA n'est pas disponible, on garde la photo
 * et on peut relancer l'analyse plus tard : rien n'est perdu.
 */
import { readPhoto, lastError as lastAiError } from "@/lib/provider";

export type LessonPhoto = {
  id: string;
  subject_id: string;
  title: string;
  /** data:image/… ; base64 */
  image: string;
  created_at: string;
  /** texte transcrit du cahier */
  text: string;
  /** id de la carte mentale créée, quand elle existe */
  sheet_id: string | null;
  status: "à lire" | "lu" | "erreur";
  error?: string;
};

const KEY = "academie.cours.v1";

export function loadPhotos(): LessonPhoto[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LessonPhoto[]) : [];
  } catch {
    return [];
  }
}

export function savePhotos(list: LessonPhoto[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    throw new Error(
      "La mémoire du navigateur est pleine : supprime d'anciennes photos de cours, ou garde-les en plus petit format.",
    );
  }
}

export function newId(): string {
  return `ph_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/** Réduit la photo (1600 px de large, JPEG 80 %) : lisible par l'IA et légère à ranger. */
export function shrinkPhoto(file: File, maxSide = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Photo illisible."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Photo illisible."));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Photo illisible."));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

const CONSIGNE = `Tu transcris la photo d'un cahier d'élève de 5e.
1. Transcris fidèlement TOUT le texte lisible (titres, définitions, listes, formules, dates, vocabulaire, schémas décrits entre crochets). Corrige seulement les fautes d'orthographe évidentes.
2. Ne commente pas, ne résume pas : tu écris le cours tel qu'il est, en français, en lignes courtes.
3. Termine par une ligne « MATIÈRE : <français | mathématiques | histoire | géographie | anglais | espagnol | allemand | svt | physique-chimie | technologie | musique | arabe | culture> ».`;

/** Lit la photo et renvoie le texte du cours. */
export async function transcribePhoto(dataUrl: string): Promise<string> {
  const text = await readPhoto(dataUrl, CONSIGNE);
  if (!text) throw new Error(lastAiError ?? "L'IA n'a pas répondu.");
  return text;
}

export type MindMap = { title: string; branches: { label: string; items: string[] }[] };

/**
 * Transforme un texte de cours en carte mentale : un titre, 3 à 6 branches,
 * 2 à 5 mots-clés par branche. Réponse demandée en JSON strict.
 */
export async function mindMapFromText(text: string, matiere: string): Promise<MindMap> {
  const consigne = `Transforme ce cours de ${matiere} en carte mentale pour une élève de 5e.
Réponds UNIQUEMENT par un JSON valide, sans texte autour, de cette forme :
{"title":"titre court du cours","branches":[{"label":"nom de la branche","items":["mot-clé 1","mot-clé 2"]}]}
Règles : 3 à 6 branches ; 2 à 5 items par branche ; items de 1 à 6 mots ; aucune phrase complète ; garde les dates, formules et mots importants du cours.

COURS :
${text.slice(0, 6000)}`;
  const raw = await readPhotoText(consigne);
  return parseMindMap(raw);
}

/** Appel texte pur (sans image) pour la mise en carte mentale. */
async function readPhotoText(consigne: string): Promise<string> {
  // 1 px transparent : réutilise le même chemin d'appel que les photos.
  const blank =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  const text = await readPhoto(blank, consigne);
  if (!text) throw new Error(lastAiError ?? "L'IA n'a pas répondu.");
  return text;
}

export function parseMindMap(raw: string): MindMap {
  const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
  const data = JSON.parse(json) as MindMap;
  const branches = (data.branches ?? [])
    .filter((b) => b && typeof b.label === "string")
    .map((b) => ({ label: b.label.trim(), items: (b.items ?? []).map((i) => String(i).trim()).filter(Boolean) }))
    .filter((b) => b.items.length > 0);
  if (!data.title || branches.length === 0) throw new Error("La carte mentale renvoyée est incomplète.");
  return { title: data.title.trim(), branches };
}
