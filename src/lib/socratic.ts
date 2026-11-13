import type { ChatMessage, Profile, Sheet, Subject } from "@/lib/types";

// ---------------------------------------------------------------------------
// Dame Morgane, professeure socratique
//   Elle ne donne JAMAIS la réponse tout de suite : elle questionne, donne un
//   indice, puis explique — étape par étape, comme dans la version d'origine.
// ---------------------------------------------------------------------------

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s/+-]/g, " ");

/** Radical approximatif : « vassal », « vassaux », « féodal », « féodaux » se rejoignent. */
const stem = (w: string) => (w.length > 4 ? w.replace(/(aux|als|es|s|x)$/, "") : w);

/** Les mots du sujet, plus les formes voisines présentes dans le texte comparé. */
function matches(word: string, text: string): boolean {
  const st = stem(word);
  if (st.length < 4) return false;
  if (text.includes(st)) return true;
  // tolérance d'une lettre finale (« feodal » / « feodalite », « vassal » / « vassalique »)
  return st.length >= 4 && text.split(/\s+/).some((t) => t.startsWith(st.slice(0, Math.max(4, st.length - 1))));
}

const STOP = new Set([
  "comment", "pourquoi", "quand", "quelle", "quelles", "quel", "quels", "est", "sont", "que", "qui", "quoi",
  "dans", "avec", "pour", "mais", "plus", "moins", "fait", "faire", "peux", "peut", "aide", "aider", "moi",
  "explique", "expliquer", "dire", "donne", "dis", "sais", "pas", "sur", "une", "des", "les", "mon", "ton",
  "the", "and", "this", "cette", "cest", "jai", "je", "tu", "il", "elle", "nous", "vous", "ils", "elles",
]);

const keywords = (s: string) => norm(s).split(/[\s-]+/).filter((w) => w.length > 3 && !STOP.has(w));

/** Étape 1 : la question de relance (aucun contenu de cours). */
export function probeQuestion(message: string, profile: Profile): string {
  const kw = keywords(message)[0];
  const sujet = kw ? `« ${kw} »` : "ce sujet";
  const openers = [
    `Belle question, ${profile.name} ! Avant que je t'aiguille, dis-moi ce que tu sais déjà sur ${sujet} — même une petite idée.`,
    `Bonne piste de réflexion ! Écris-moi en une phrase ce que ${sujet} évoque pour toi, et je pars de là.`,
    `J'aime que tu cherches ! Commence par me dire : à quel moment as-tu rencontré ${sujet} en classe ?`,
  ];
  const pick = openers[Math.abs(hash(message + profile.name)) % openers.length];
  return `${pick}\n\nSi vraiment tu n'as aucune piste, écris simplement : **indice**.`;
}

/** Étape 2 : un indice, toujours sans la réponse complète. */
export type QuizSeed = { q: string; options: string[]; answer: string; why: string };

export function giveHint(message: string, subjectId: string | null, subjects: Subject[], sheets: Sheet[], bank: Record<string, QuizSeed[]> = {}): string {
  const kw = keywords(message);
  const hit = findSheet(kw, subjectId, sheets);
  const scope = subjectId ? subjects.filter((s) => s.id === subjectId) : subjects;
  const chapter = findChapter(kw, scope);

  if (hit) {
    const s = sheets.find((x) => x.id === hit) !;
    const first = s.kind === "carte" ? s.branches[0] : null;
    const line = first ? `${first.label} : ${first.items[0].toLowerCase()}` : firstLine(s.content);
    return `Indice n°1 — va voir la fiche **${s.title}** dans la Bibliothèque.\nElle commence par : « ${line} ».\n\nÀ ton avis, quel mot de cette phrase répond à ta question ? Dis-le moi et on avance ensemble.`;
  }
  if (chapter) {
    const firstQuiz = bank[chapter.c.id]?.[0];
    const linked = sheetsForChapter(chapter.c, chapter.s.id, sheets)[0] ?? null;
    const suite = linked
      ? `\n\nBonus : la fiche **${linked.title}** de la Bibliothèque va dans le même sens.`
      : firstQuiz
        ? `\n\nUn aperçu du quiz : « ${firstQuiz.q.replace(/\s*\?$/, "")} » — que répondrais-tu, à ton avis ?`
        : "";
    return `Indice n°1 — c'est dans le chapitre **${chapter.c.title}** (${chapter.s.name}) : « ${chapter.c.description} ».\n\nOuvre-le dans **Matières**, lis le titre, et dis-moi ce que tu en retiens. Ensuite je te donne l'indice n°2.${suite}`;
  }
  const calc = message.match(/(-?\d+[.,]?\d*)\s*([+\-*/x])\s*(-?\d+[.,]?\d*)/);
  if (calc) {
    return `Indice n°1 — pose l'opération sur une ligne et regarde les priorités : parenthèses, puis × et ÷, et seulement après + et −.\n\nQue trouves-tu pour \`${calc[1]} ${calc[2]} ${calc[3]}\` ? Je vérifie avec toi juste après.`;
  }
  return `Indice n°1 — cherche d'abord une **fiche méthode** dans la Bibliothèque sur ce thème, puis lance un **quiz de 3 questions** sur le chapitre le plus proche : les explications des questions servent de leçon.\n\nReviens me dire ce que tu as compris, je continue à te guider.`;
}

/** Étape 3 : l'explication complète, seulement après que l'élève a essayé. */
export function fullExplanation(
  message: string,
  subjectId: string | null,
  subjects: Subject[],
  sheets: Sheet[],
  profile: Profile,
  bank: Record<string, QuizSeed[]> = {},
): string {
  const kw = keywords(message);
  const hit = findSheet(kw, subjectId, sheets);
  if (hit) {
    const s = sheets.find((x) => x.id === hit)!;
    const subj = subjects.find((x) => x.id === s.subject_id);
    const body = s.kind === "carte" ? s.branches.map((b) => `• ${b.label} : ${b.items.join(", ")}`).join("\n") : s.content;
    return `Voilà l'explication complète, ${profile.name} — **${s.title}** (${subj?.magic_name ?? "Académie"}) :\n\n${body}\n\nMaintenant referme cette fiche et refais-le de mémoire : c'est comme ça que la magie reste !`;
  }
  const chapter = findChapter(kw, subjectId ? subjects.filter((s) => s.id === subjectId) : subjects);
  if (chapter) {
    const firstQuiz = bank[chapter.c.id]?.[0];
    const linked = sheetsForChapter(chapter.c, chapter.s.id, sheets)[0] ?? null;
    const quizHint = firstQuizHint(chapter.c.id, bank);
    if (linked) {
      const body = linked.kind === "carte" ? linked.branches.map((b) => `• ${b.label} : ${b.items.join(", ")}`).join("\n") : linked.content;
      return `Voilà la leçon, ${profile.name} — **${chapter.c.title}** (${chapter.s.name}) : ${chapter.c.description}.\n\n${body}\n\nMaintenant referme la fiche et refais-le de mémoire : c'est comme ça que la magie reste !`;
    }
    if (quizHint) {
      return `Voilà la leçon, ${profile.name} — **${chapter.c.title}** (${chapter.s.name}) : ${chapter.c.description}.\n\n${quizHint}\n\nMon conseil : ouvre ce chapitre dans **Matières** et lance un quiz de 3 questions pour vérifier.`;
    }
    return `Voilà la leçon : **${chapter.c.title}** (${chapter.s.name}) — ${chapter.c.description}.\n\nMon conseil de professeure :\n1. Ouvre ce chapitre dans **Matières** et lis-le.\n2. Fais un quiz de 3 questions dessus.\n3. Note ce qui te résiste encore et repose-moi la question.`;
  }
  const calc = message.match(/(-?\d+[.,]?\d*)\s*([+\-*/x])\s*(-?\d+[.,]?\d*)/);
  if (calc) {
    const a = Number(calc[1].replace(",", "."));
    const b = Number(calc[3].replace(",", "."));
    const op = calc[2];
    const r = op === "+" ? a + b : op === "-" ? a - b : op === "*" || op === "x" ? a * b : b === 0 ? NaN : a / b;
    if (!Number.isNaN(r)) return `Le résultat est **${a} ${op} ${b} = ${r}**.\n\nMéthode : parenthèses d'abord, puis × et ÷, enfin + et −. Refais-le seul une fois pour vérifier.`;
  }
  return `Je n'ai pas de fiche exacte sur ce point dans la Bibliothèque, ${profile.name}. Reformule avec un mot du cours (par exemple le titre du chapitre), ou demande-moi de te **créer une fiche** sur ce sujet : je peux l'ajouter à la Bibliothèque.`;
}

/** Mots-clés d'aide : l'élève demande explicitement de l'aide ou une réponse. */
export const HELP_WORDS = ["indice", "aide", "aidez", "explique", "donne", "reponse", "réponse", "corrige", "solution", "je ne sais pas", "je sais pas", "j abandonne", "j'abandonne", "montre"];
export const WANTS_ANSWER = ["reponse", "réponse", "solution", "le resultat", "le résultat", "dis moi", "dis-moi", "la reponse", "la réponse"];

export function wantsHelp(message: string): boolean {
  const m = norm(message);
  return HELP_WORDS.some((w) => m.includes(norm(w)));
}
export function wantsAnswer(message: string): boolean {
  const m = norm(message);
  return WANTS_ANSWER.some((w) => m.includes(norm(w)));
}
/** L'élève a-t-il déjà tenté une réponse ? (message long ou contenant un essai) */
export function looksLikeAttempt(message: string): boolean {
  const words = norm(message).split(/\s+/).filter(Boolean);
  return words.length >= 4 || /\d|=|\//.test(message);
}

/** La première explication de la banque de questions : une mini-leçon toute prête. */
function firstQuizHint(chapterId: string, bank: Record<string, QuizSeed[]>): string | null {
  const first = bank[chapterId]?.[0];
  if (!first) return null;
  return `À retenir : ${first.q.replace(/\s*\?$/, "")} → **${first.answer}**. ${first.why}`;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function firstLine(content: string): string {
  const l = content.split("\n").find((x) => x.trim().length > 0) ?? content;
  return l.replace(/^\d+\.\s*/, "").trim();
}

function findSheet(kw: string[], subjectId: string | null, sheets: Sheet[]): string | null {
  if (kw.length === 0) return null;
  const pool = subjectId ? sheets.filter((s) => s.subject_id === subjectId) : sheets;
  let best: { id: string; score: number } | null = null;
  for (const s of pool) {
    const text = norm(`${s.title} ${s.content} ${s.branches.map((b) => b.label + " " + b.items.join(" ")).join(" ")}`);
    const score = kw.filter((w) => matches(w, text)).length;
    if (score > 0 && (!best || score > best.score)) best = { id: s.id, score };
  }
  return best?.id ?? null;
}

function sheetsForChapter(chapter: { title: string; description: string }, subjectId: string, sheets: Sheet[]): Sheet[] {
  const words = [...keywords(chapter.title), ...keywords(chapter.description)];
  return sheets.filter((s) => {
    if (s.subject_id !== subjectId) return false;
    const text = norm(`${s.title} ${s.content}`);
    return words.some((w) => matches(w, text));
  });
}

function findChapter(kw: string[], subjects: Subject[]): { s: Subject; c: Subject["chapters"][number] } | null {
  if (kw.length === 0) return null;
  let best: { s: Subject; c: Subject["chapters"][number]; score: number } | null = null;
  for (const s of subjects) {
    for (const c of s.chapters) {
      const text = norm(`${c.title} ${c.description}`);
      const score = kw.filter((w) => matches(w, text)).length;
      if (score > 0 && (!best || score > best.score)) best = { s, c, score };
    }
  }
  return best ? { s: best.s, c: best.c } : null;
}

// ---------------------------------------------------------------------------
// Prompt du modèle (quand une clé API est configurée) : méthode socratique
// ---------------------------------------------------------------------------
export const SOCRATIC_SYSTEM = `Tu es Dame Morgane, professeure de "L'Académie de Jana", une école magique pour une élève de 5e (12 ans). Tu réponds en français.
MÉTHODE (très importante) :
1. Tu ne donnes JAMAIS la réponse ou la solution dès le premier message.
2. Premier message : tu reformules la question en une ligne, puis tu poses UNE question simple qui fait réfléchir l'élève, et tu proposes de taper "indice" s'il sèche.
3. Si l'élève demande un indice : tu donnes un seul indice concret, sans révéler la réponse finale.
4. Si l'élève a essayé (même faux) : tu dis ce qui est juste dans son essai, tu corriges ce qui ne va pas, puis tu donnes l'explication complète pas à pas avec un exemple.
5. Si l'élève demande explicitement "la réponse" après avoir cherché : tu donnes l'explication complète, sinon tu relances encore une fois.
Style : chaleureux, imagé (château, potions, runes) mais sobre, 3 à 6 phrases, maximum un exemple. Tu cites la fiche de la Bibliothèque quand elle existe. Tu termines par une question ou une courte validation.`;

export type Memory = { tried: boolean; hinted: boolean };

/** Décide de l'étape socratique d'après l'historique de la conversation. */
type Turn = { role: "user" | "assistant"; content: string };

/** « oui », « a », « 3/4 », « je ne sais pas » : une réponse courte, pas une nouvelle question. */
const shortReply = (m: string) => {
  const t = m.trim();
  return t.length <= 25 || /^(oui|non|ok|a|b|c|d)\b/i.test(t);
};

export function stepOf(history: Turn[], message: string, memory: Memory): "probe" | "hint" | "explain" {
  if (wantsAnswer(message) && (memory.hinted || memory.tried)) return "explain";
  if (wantsHelp(message)) return "hint";
  if (memory.hinted && looksLikeAttempt(message)) return "explain";
  if (memory.tried && !wantsHelp(message)) return "hint";
  if (history.length >= 2 && shortReply(message)) return "explain";
  const lastAssistant = [...history].reverse().find((m) => m.role === "assistant");
  if (lastAssistant && history.length >= 2) {
    // une conversation est engagée : si l'élève écrit un essai, on explique
    if (looksLikeAttempt(message)) return "explain";
    return "hint";
  }
  return "probe";
}

/** Enveloppe une leçon (fiche + chapitre + exemples) en réponse directe de la professeure. */
export function lessonAnswer(message: string, profile: Profile, lesson: string, topic?: string): string {
  const kw = keywords(message).filter((w) => !["explique", "expliques", "comment", "pourquoi", "cest", "quoi"].includes(w))[0];
  // Le sujet annoncé est celui de la fiche (« Le passé simple »), pas le verbe de la
  // question (« conjuguer ») : sinon la leçon semble répondre à côté.
  const subject = (topic ?? "").replace(/\s*\(.*\)\s*$/, "").replace(/^(reconna[^\s]*|comprendre|utiliser|ma[iî]triser)\s+/i, "").trim();
  const intro = subject
    ? `Bien sûr, ${profile.name} ! Voici la leçon sur **${subject}**, avec des exemples :`
    : kw
      ? `Bien sûr, ${profile.name} ! Parlons de **${kw}**. Voici la leçon, avec des exemples :`
      : `Bien sûr, ${profile.name} ! Voici la leçon, avec des exemples :`;
  // Le « à toi » (question de vérification) est déjà dans la leçon : on conclut sans le répéter.
  const tail = /À toi\s*:/.test(lesson)
    ? ""
    : "\n\nSi un point reste flou, demande-moi de le reprendre : je peux détailler étape par étape.";
  return `${intro}\n\n${lesson}${tail}`;
}

// ---------------------------------------------------------------------------
// Prompt du modèle : une professeure qui explique vraiment, avec des exemples
// ---------------------------------------------------------------------------
export const TUTOR_SYSTEM = `Tu es Dame Morgane, professeure de "L'Académie de Jana", une école magique pour une élève de 5e (12 ans). Tu réponds en français.
TON RÔLE : aider vraiment l'élève. Tu DONNES la réponse et l'explication, tu ne laisses jamais l'élève sans solution.
SUIVI DE LA CONVERSATION : tu lis tout l'échange. Si l'élève répond à la question que tu viens de poser (même par « A », « oui », « 3/4 »), tu commences par la corriger, puis tu continues sur le MÊME sujet. Tu ne changes jamais de sujet de toi-même. Si l'élève dit « je n'ai pas compris », tu reprends la même leçon autrement, plus simplement, avec un nouvel exemple.
QUESTIONS DE VÉRIFICATION : tu en poses une à la fin, en proposant 3 réponses (A, B, C) dont une seule est juste, et tu indiques laquelle est la bonne. La question reste la même jusqu'à ce que l'élève y réponde.
MÉTHODE POUR CHAQUE RÉPONSE :
1. Une phrase de réponse directe à la question.
2. L'explication pas à pas (2 à 4 étapes numérotées), dans les mots d'une élève de 12 ans.
3. Au moins UN exemple concret et résolu (un calcul, une phrase d'espagnol, un cas historique...).
4. Un mini-« à retenir » en une ligne.
5. Une question de vérification simple pour finir (« Et si je te demandais… ? »).
Style : chaleureux, imagé (château, potions, runes) mais sobre. 6 à 12 phrases maximum. Aucune réponse bâclée : si tu ne sais pas, dis-le et propose une piste.`;
