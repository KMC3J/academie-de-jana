/**
 * Dictionnaire multilingue (français ⇄ anglais, français ⇄ espagnol).
 *
 * Deux étages, pour rester utilisable même sans internet :
 *  1. un vrai dictionnaire embarqué (12 000 mots par langue) pour l'orthographe
 *     et les suggestions « vouliez-vous dire… ? » ;
 *  2. les traductions elles-mêmes, faites par l'IA quand une clé est enregistrée
 *     (avec le contexte, le niveau collège/lycée, un exemple de phrase).
 * Sans clé, on retombe sur le petit lexique scolaire déjà présent dans knowledge.ts.
 */
import words from "@/data/dictionaries.json";
import { askModel, getAiConfig } from "@/lib/provider";
import { translationAnswer } from "@/lib/knowledge";

export type Lang = "fr" | "en" | "es";

export const LANGS: { id: Lang; label: string; flag: string; name: string }[] = [
  { id: "fr", label: "Français", flag: "FR", name: "français" },
  { id: "en", label: "Anglais", flag: "GB", name: "anglais" },
  { id: "es", label: "Espagnol", flag: "ES", name: "espagnol" },
];

const WORDS = words as Record<Lang, string>;
const SETS: Record<Lang, Set<string>> = {
  fr: new Set(WORDS.fr.split("\n")),
  en: new Set(WORDS.en.split("\n")),
  es: new Set(WORDS.es.split("\n")),
};
const LISTS: Record<Lang, string[]> = {
  fr: WORDS.fr.split("\n"),
  en: WORDS.en.split("\n"),
  es: WORDS.es.split("\n"),
};

const strip = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

/** Le mot existe-t-il dans le dictionnaire de cette langue ? */
export function isKnown(word: string, lang: Lang): boolean {
  return SETS[lang].has(strip(word));
}

/** « vouliez-vous dire… ? » : les mots du dictionnaire les plus proches. */
export function suggestions(word: string, lang: Lang, max = 4): string[] {
  const w = strip(word);
  if (w.length < 3) return [];
  const near: { w: string; d: number }[] = [];
  const dist = (a: string, b: string) => {
    if (Math.abs(a.length - b.length) > 3) return 99;
    const dp = new Array(b.length + 1).fill(0).map((_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      let prev = dp[0];
      dp[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = dp[j];
        dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
      }
    }
    return dp[b.length];
  };
  for (const cand of LISTS[lang]) {
    if (Math.abs(cand.length - w.length) > 2) continue;
    const d = dist(w, cand);
    if (d <= 2) near.push({ w: cand, d });
  }
  near.sort((a, b) => a.d - b.d || a.w.localeCompare(b.w));
  return near.slice(0, max).map((x) => x.w);
}

export type Entry = {
  word: string;
  from: Lang;
  to: Lang;
  /** traductions principales */
  translations: string[];
  /** nature grammaticale (nom, verbe…) */
  pos: string;
  /** phrase d'exemple + sa traduction */
  example: string;
  exampleTranslation: string;
  /** remarque de niveau (faux ami, accord, genre…) */
  note: string;
  /** vrai = l'IA a répondu, faux = petit lexique local */
  ai: boolean;
};

const SYSTEM = `Tu es un dictionnaire bilingue pour un élève français de collège ou de lycée.
Tu réponds UNIQUEMENT par un JSON valide, sans texte autour :
{"translations":["..."],"pos":"nom|verbe|adjectif|adverbe|expression|...","example":"phrase simple dans la langue source","exampleTranslation":"la même phrase traduite","note":"remarque utile (faux ami, genre, pluriel, niveau) ou chaîne vide"}
Règles : 1 à 3 traductions, les plus courantes d'abord ; vocabulaire courant et scolaire ; phrases courtes (8 mots maximum) ; jamais d'invention.`;

/** Traduit un mot ou une expression, avec exemple et remarque. */
export async function lookup(text: string, from: Lang, to: Lang): Promise<Entry> {
  const word = text.trim();
  const base: Entry = { word, from, to, translations: [], pos: "", example: "", exampleTranslation: "", note: "", ai: false };
  if (!word) return base;

  if (getAiConfig().apiKey.trim()) {
    const reply = await askModel(
      SYSTEM,
      `Traduis du ${LANGS.find((l) => l.id === from)!.name} vers le ${LANGS.find((l) => l.id === to)!.name} : « ${word} ».`,
      { name: "Jana" } as never,
      [],
    );
    if (reply) {
      try {
        const json = reply.slice(reply.indexOf("{"), reply.lastIndexOf("}") + 1);
        const data = JSON.parse(json) as Partial<Entry>;
        const translations = (data.translations ?? []).map((t) => String(t).trim()).filter(Boolean).slice(0, 3);
        if (translations.length > 0) {
          return {
            ...base,
            translations,
            pos: String(data.pos ?? "").trim(),
            example: String(data.example ?? "").trim(),
            exampleTranslation: String(data.exampleTranslation ?? "").trim(),
            note: String(data.note ?? "").trim(),
            ai: true,
          };
        }
      } catch {
        /* réponse illisible : on passe au lexique local */
      }
    }
  }

  // Secours local (sans clé ou sans réseau) : le lexique scolaire de knowledge.ts
  const local = translationAnswer(`comment dit-on ${word} en ${LANGS.find((l) => l.id === to)!.name}`);
  if (local && !/Je ne connais pas/.test(local)) {
    // La phrase utile est « **« mot » se dit « house » en anglais.** » : on prend
    // la 2e citation, jamais la première (qui répète le mot cherché).
    const quoted = [...local.matchAll(/«\s*([^»]+?)\s*»/g)].map((m) => m[1].trim());
    const tr = quoted.length > 1 ? quoted[1] : quoted[0];
    const ex = /\*\*Exemple :\*\*\s*(.+)/.exec(local)?.[1]?.trim() ?? "";
    return { ...base, translations: tr ? [tr] : [], example: ex, note: "Traduction du lexique de l'Académie (petit lexique scolaire)." };
  }
  return { ...base, note: "Mot absent du lexique local : ajoute la clé Gemini pour une traduction complète." };
}
