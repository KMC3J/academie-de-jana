// Banque de dictées du collège (5e) : phrases courtes, une difficulté par niveau.
// Chaque dictée porte ses « pièges » : les mots sur lesquels on bute le plus souvent.
export type Dictee = {
  id: string;
  title: string;
  level: "facile" | "moyen" | "difficile";
  hint: string;
  text: string;
  traps: { word: string; why: string }[];
};

export const DICTEES: Dictee[] = [
  {
    id: "d-imparfait",
    title: "Les toits du château",
    level: "facile",
    hint: "Imparfait et pluriels en -aux",
    text: "Les toits du château brillaient sous la lune. Les hiboux regardaient les élèves qui rentraient au dortoir.",
    traps: [
      { word: "brillaient", why: "Imparfait, 3e personne du pluriel : -aient." },
      { word: "hiboux", why: "Pluriel en -oux : hiboux, bijoux, cailloux, choux, genoux, joujoux." },
      { word: "rentraient", why: "Imparfait : le sujet « les élèves qui » est au pluriel." },
    ],
  },
  {
    id: "d-passe-simple",
    title: "La porte de la bibliothèque",
    level: "moyen",
    hint: "Passé simple et participes passés",
    text: "Elle ouvrit la porte, entra dans la bibliothèque et chercha le grimoire que Dame Morgane lui avait conseillé.",
    traps: [
      { word: "ouvrit", why: "Passé simple du 3e groupe : il ouvrit, ils ouvrirent." },
      { word: "chercha", why: "Passé simple du 1er groupe, 3e personne du singulier : -a." },
      { word: "conseillé", why: "Participe passé employé avec avoir : accord avec le COD placé avant (« que » = le grimoire)." },
    ],
  },
  {
    id: "d-homophones",
    title: "La potion de la Tour des rêves",
    level: "moyen",
    hint: "Homophones a / à, ou / où, ce / se",
    text: "Où se cache la potion que le professeur a préparée ? Ce n'est pas à moi de la chercher, mais à tous les élèves.",
    traps: [
      { word: "Où", why: "« où » avec accent = lieu ; « ou » sans accent = choix." },
      { word: "se", why: "« se » devant un verbe pronominal (se cacher) ; « ce » devant un nom." },
      { word: "a", why: "« a » = verbe avoir ; « à » = préposition." },
      { word: "préparée", why: "Accord avec le COD « que » (= la potion) placé avant l'auxiliaire avoir." },
    ],
  },
  {
    id: "d-accords",
    title: "Les élèves de 5e",
    level: "difficile",
    hint: "Accords complexes, mots en -amment, tout",
    text: "Les élèves, fatigués par leurs longues recherches, sont rentrés tout doucement ; ils ont trouvé les réponses qu'ils avaient cherchées.",
    traps: [
      { word: "fatigués", why: "Participe passé adjectif : accord avec « les élèves » (masculin pluriel)." },
      { word: "sont rentrés", why: "Verbe pronominal à l'auxiliaire être : accord avec le sujet." },
      { word: "tout", why: "« tout doucement » : adverbe, donc invariable." },
      { word: "cherchées", why: "COD « qu' » (= les réponses) placé avant l'auxiliaire avoir : accord féminin pluriel." },
    ],
  },
  {
    id: "d-accents",
    title: "L'Observatoire",
    level: "difficile",
    hint: "Accents, cédille et mots en -emment",
    text: "Au-dessus de l'Observatoire, les étoiles scintillaient étrangement ; le professeur, très savant, expliquait leur mouvement avec précision.",
    traps: [
      { word: "Au-dessus", why: "« au-dessus » (position) et non « au dessus » : trait d'union obligatoire." },
      { word: "étrangement", why: "Adverbe en -amment / -emment : ici -emment car « étrange » finit par un e muet." },
      { word: "étoiles", why: "Accent aigu sur le é initial." },
      { word: "précision", why: "Cédille sous le c devant o pour garder le son [s]." },
    ],
  },
];

// ---------------------------------------------------------------------------
// Correction : comparaison mot à mot, insensible à la casse mais sensible
// à l'orthographe, aux accents et à la ponctuation.
// ---------------------------------------------------------------------------
export type WordDiff = { word: string; status: "ok" | "wrong" | "missing" | "extra" };

const PUNCT = /[.,;:!?«»"()…]/g;

/** Découpe en mots en gardant la ponctuation collée au mot (utile pour la dictée). */
export function splitWords(s: string): string[] {
  return s
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

/** Forme normalisée d'un mot : sans ponctuation ni majuscule, mais avec ses accents. */
export function normalizeWord(w: string): string {
  return w
    .replace(PUNCT, "")
    .replace(/[’']/g, "'")
    .toLowerCase();
}

/**
 * Aligne les mots attendus et les mots saisis (distance d'édition mot à mot),
 * pour distinguer une faute de frappe d'un mot oublié ou ajouté.
 */
export function diffWords(expected: string, given: string): WordDiff[] {
  const a = splitWords(expected);
  const b = splitWords(given);
  const na = a.map(normalizeWord);
  const nb = b.map(normalizeWord);

  // Programmation dynamique : coût d'alignement minimal.
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const same = na[i - 1] === nb[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j - 1] + same, dp[i - 1][j] + 1, dp[i][j - 1] + 1);
    }
  }

  const out: WordDiff[] = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const same = na[i - 1] === nb[j - 1] ? 0 : 1;
      if (dp[i][j] === dp[i - 1][j - 1] + same) {
        out.unshift({ word: a[i - 1], status: same === 0 ? "ok" : "wrong" });
        i--;
        j--;
        continue;
      }
    }
    if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      out.unshift({ word: a[i - 1], status: "missing" });
      i--;
      continue;
    }
    out.unshift({ word: b[j - 1], status: "extra" });
    j--;
  }
  return out;
}

export type DicteeResult = {
  totalWords: number;
  correctWords: number;
  score: number; // pourcentage arrondi
  trapsMissed: string[];
  diff: WordDiff[];
};

export function correctDictee(dictee: Dictee, given: string): DicteeResult {
  const diff = diffWords(dictee.text, given);
  const totalWords = diff.filter((d) => d.status !== "extra").length;
  const correctWords = diff.filter((d) => d.status === "ok").length;
  const score = totalWords ? Math.round((correctWords / totalWords) * 100) : 0;
  const trapsMissed = dictee.traps
    .filter((t) => {
      const nw = normalizeWord(t.word);
      const found = diff.find((d) => normalizeWord(d.word) === nw);
      return !found || found.status !== "ok";
    })
    .map((t) => t.word);
  return { totalWords, correctWords, score, trapsMissed, diff };
}
