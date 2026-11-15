/**
 * Mes cours : les photos du cahier de Jana.
 *
 * Une photo est rangée dans le navigateur (localStorage), lue par l'IA (Gemini
 * sait lire les images), puis transformée en carte mentale rangée dans
 * « Fiches & cartes mentales ». Si l'IA n'est pas disponible, on garde la photo
 * et on peut relancer l'analyse plus tard : rien n'est perdu.
 */
import { askModel, getAiConfig, readPhoto, lastError as lastAiError } from "@/lib/provider";

/** Un document ajouté : une photo du cahier, ou un PDF. */
export type DocKind = "photo" | "pdf";

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
  /** photo du cahier (par défaut) ou fichier PDF */
  doc?: DocKind;
  /** PDF : nombre de pages du document */
  pages?: number;
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

/** Extrait le texte d'un PDF, page par page. Renvoie le texte et le nombre de pages. */
export async function pdfToText(file: File): Promise<{ text: string; pages: number }> {
  const pdfjs = await import("pdfjs-dist");
  // Le lecteur PDF travaille dans un fil séparé : on lui donne son fichier.
  // (?url = l'adresse du fichier worker ; absente en test hors navigateur.)
  try {
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    if (typeof worker.default === "string") pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  } catch {
    /* hors navigateur : on laisse pdf.js se débrouiller */
  }
  const data = new Uint8Array(await file.arrayBuffer());
  // pdf.js a besoin de ses polices de base pour lire correctement les accents
  // des PDF créés hors traitement de texte.
  let standardFontDataUrl: string | undefined;
  try {
    standardFontDataUrl = new URL("pdfjs-dist/standard_fonts/", import.meta.url).href;
  } catch {
    standardFontDataUrl = undefined;
  }
  const doc = await pdfjs.getDocument({ data, standardFontDataUrl }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((it) => ("str" in it ? it.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (line) parts.push(`— page ${i} —\n${line}`);
  }
  return { text: parts.join("\n\n"), pages: doc.numPages };
}

/** Lit la photo et renvoie le texte du cours. */
export async function transcribePhoto(dataUrl: string): Promise<string> {
  const text = await readPhoto(dataUrl, CONSIGNE);
  if (!text) throw new Error(lastAiError ?? "L'IA n'a pas répondu.");
  return text;
}

const CONSIGNE_PDF = `Tu reçois le texte brut d'un document de cours (PDF) d'un élève de 5e.
1. Rends ce cours lisible : garde les titres, définitions, listes, formules, dates et vocabulaire, dans l'ordre du document. Corrige les fautes évidentes et recolle les mots coupés en fin de ligne.
2. Supprime ce qui n'est pas du cours (en-têtes, pieds de page, numéros isolés, publicités, noms de fichiers).
3. Ne résume pas, n'invente rien : si un passage est illisible, écris [illisible].
4. Termine par une ligne « MATIÈRE : <français | mathématiques | histoire | géographie | anglais | espagnol | allemand | svt | physique-chimie | technologie | musique | arabe | culture> ».`;

/** Range un long texte de PDF en cours propre (par lots de pages). */
export async function cleanPdfText(raw: string): Promise<string> {
  const chunks = raw.match(/[\s\S]{1,5000}/g) ?? [];
  const out: string[] = [];
  for (const chunk of chunks.slice(0, 8)) {
    const text = await readPhotoText(`${CONSIGNE_PDF}\n\nDOCUMENT :\n${chunk}`);
    out.push(text);
  }
  return out.join("\n\n").trim();
}

export type MindMap = { title: string; branches: { label: string; items: string[] }[] };

/**
 * Transforme un texte de cours en carte mentale : un titre, 3 à 6 branches,
 * 2 à 5 mots-clés par branche. Réponse demandée en JSON strict.
 */
export async function mindMapFromText(text: string, matiere: string): Promise<MindMap> {
  // Un cours très long (PDF) : on garde les parties les plus riches en vocabulaire.
  text = text.length > 6000 ? text.slice(0, 3000) + "\n[…]\n" + text.slice(-3000) : text;
  const consigne = `Transforme ce cours de ${matiere} en carte mentale pour une élève de 5e.
Réponds UNIQUEMENT par un JSON valide, sans texte autour, de cette forme :
{"title":"titre court du cours","branches":[{"label":"nom de la branche","items":["mot-clé 1","mot-clé 2"]}]}
Règles : 3 à 6 branches ; 2 à 5 items par branche ; items de 1 à 6 mots ; aucune phrase complète ; garde les dates, formules et mots importants du cours.

COURS :
${text.slice(0, 6000)}`;
  // La carte mentale est un travail de TEXTE : on passe par askModel (même chemin
  // que Dame Morgane), pas par l'envoi d'image — sinon un fournisseur qui refuse
  // les images bloque aussi la carte, et une image de 1 px fait perdre du temps.
  const cfg = getAiConfig();
  const raw = await askModel(SYSTEM_CARTE, consigne, { name: "Jana" } as never, []);
  if (!raw) {
    const why = lastAiError ?? "L'IA n'a pas répondu";
    throw new Error(
      cfg.apiKey.trim()
        ? `L'IA n'a pas répondu : ${why}`
        : "Aucune clé IA : la carte mentale a besoin de Gemini (Professeur magique → Cerveau de Dame Morgane).",
    );
  }
  return parseMindMap(raw);
}

const SYSTEM_CARTE = `Tu es Dame Morgane, professeure de l'Académie de Jana. Tu construis des cartes mentales claires pour une élève de 5e.
Tu réponds UNIQUEMENT par un JSON valide, sans texte autour, sans balises de code.`;

/** Appel texte pur (sans image) — conservé pour les cas où une image est nécessaire. */
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
