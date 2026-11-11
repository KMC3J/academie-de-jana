// Couche « API » locale du clone : même surface que le client fetch de l'app d'origine
// (apiGet / apiPost / apiPut / apiDelete / apiStream), mais branchée sur le localStorage
// de ce navigateur au lieu d'un serveur FastAPI. Les pages n'ont donc pas été modifiées.
//
// Ce qui est simulé localement :
//  · profils, avatars, badges, XP/étoiles/cristaux, progression par matière
//  · matières & chapitres, quêtes, fiches, emploi du temps (éditables côté parent)
//  · quiz : questions tirées d'une banque locale (data/seed.ts)
//  · professeur magique socratique : questionne d'abord, donne un indice, puis
//    explique (vraie IA si une clé API est configurée, sinon fiches locales)
//  · temps d'écran (battement de cœur toutes les 30 s), créations de l'atelier
//  · espace parent protégé par un code (par défaut 1234)

import {
  BADGES,
  MISSION_TEXT,
  QUESTION_BANK,
  QUESTS,
  SHEETS,
  SUBJECTS,
  TIMETABLE,
  defaultProfiles,
} from "@/data/seed";
import { fullExplanation, giveHint, probeQuestion, SOCRATIC_SYSTEM, stepOf } from "@/lib/socratic";
import { LIBRARY_BOOKS } from "@/data/library";
import type {
  Avatar,
  BadgeDef,
  ChapterIn,
  ChatMessage,
  ChildStats,
  Creation,
  CreationIn,
  Ok,
  ParentStatus,
  Profile,
  ProfileIn,
  Quest,
  QuestAnswerOut,
  QuestIn,
  QuizItem,
  QuizOut,
  QuizResult,
  ScreenDay,
  Sheet,
  SheetIn,
  Slot,
  SlotIn,
  Subject,
  SubjectIn,
  TodayView,
} from "@/lib/types";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`request failed with ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// ---------------------------------------------------------------------------
// Stockage
// ---------------------------------------------------------------------------
type DB = {
  profiles: Profile[];
  subjects: Subject[];
  quests: Quest[];
  sheets: Sheet[];
  timetable: Slot[];
  creations: Creation[];
  chat: Record<string, ChatMessage[]>;
  screen: Record<string, Record<string, Record<string, number>>>; // profileId → date → subject → s
  quizLog: Record<string, { score: number; total: number }[]>;
  parentPin: string;
  parentUnlocked: boolean;
};

const KEY = "academie.db.v1";
let db: DB = load();

function seed(): DB {
  return {
    profiles: defaultProfiles(),
    subjects: structuredClone(SUBJECTS),
    quests: structuredClone(QUESTS),
    sheets: structuredClone(SHEETS),
    timetable: structuredClone(TIMETABLE),
    creations: [],
    chat: {},
    screen: {},
    quizLog: {},
    parentPin: "1234",
    parentUnlocked: false,
  };
}

// Ajoute au magasin local les matières (et leurs chapitres) présentes dans le
// programme mais absentes de la sauvegarde : sans cela, un profil créé avant
// une mise à jour ne verrait jamais les nouvelles matières.
function withNewSubjects(saved: DB): DB {
  const subjects = saved.subjects ?? [];
  const known = new Set(subjects.map((s) => s.id));
  const added = SUBJECTS.filter((s) => !known.has(s.id)).map((s) => structuredClone(s));

  // Chapitres ajoutés à une matière existante
  const merged = subjects.map((s) => {
    const fresh = SUBJECTS.find((x) => x.id === s.id);
    if (!fresh) return s;
    const have = new Set((s.chapters ?? []).map((c) => c.id));
    const extra = (fresh.chapters ?? []).filter((c) => !have.has(c.id)).map((c) => ({ ...c }));
    const renamed = s.name !== fresh.name ? { name: fresh.name } : {};
    return extra.length ? { ...s, ...renamed, chapters: [...(s.chapters ?? []), ...extra] } : { ...s, ...renamed };
  });

  return { ...saved, subjects: [...merged, ...added] };
}

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return withNewSubjects({ ...seed(), ...(JSON.parse(raw) as DB) });
  } catch {
    /* stockage indisponible ou corrompu : on repart du jeu de départ */
  }
  const fresh = seed();
  // Sauvegarde immédiate : les autres modules lisent le même magasin dès le démarrage.
  try {
    localStorage.setItem(KEY, JSON.stringify(fresh));
  } catch {
    /* stockage plein : l'état restera en mémoire */
  }
  return fresh;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* quota dépassé (gros dessins) : l'état reste en mémoire */
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);
const ok: Ok = { ok: true };

// ---------------------------------------------------------------------------
// Règles de progression (mêmes barèmes que l'original)
// ---------------------------------------------------------------------------
const LEVEL_TITLES = [
  "Apprentie sorcière",
  "Apprentie sorcière",
  "Novice des sorts",
  "Élève enchantée",
  "Adepte des runes",
  "Sorcière confirmée",
  "Grande magicienne",
  "Archimage de l'Académie",
];

export function xpForLevel(level: number) {
  return 100 + (level - 1) * 50;
}

function levelTitle(level: number) {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)];
}

function normalize(p: Profile): Profile {
  let level = Math.max(1, p.level);
  let rest = Math.max(0, p.xp);
  let need = xpForLevel(level);
  while (rest >= need) {
    rest -= need;
    level += 1;
    need = xpForLevel(level);
  }
  return {
    ...p,
    level,
    level_title: levelTitle(level),
    xp_in_level: rest,
    xp_for_next: need,
  };
}

function grantBadge(p: Profile, id: string): string[] {
  if (!BADGES.some((b) => b.id === id) || p.badges.includes(id)) return [];
  p.badges = [...p.badges, id];
  return [id];
}

function findProfile(id: string | null): Profile {
  const p = db.profiles.find((x) => x.id === id);
  if (!p) throw new ApiError(404, { detail: "Profil introuvable" });
  return p;
}

// ---------------------------------------------------------------------------
// Lecture
// ---------------------------------------------------------------------------
function subjects(): Subject[] {
  return [...db.subjects].sort((a, b) => a.order - b.order);
}

function todayView(profileId: string): TodayView {
  const now = new Date();
  const weekday = (now.getDay() + 6) % 7; // 0 = lundi
  const slots = db.timetable.filter((s) => s.day === weekday).sort((a, b) => a.start.localeCompare(b.start));
  const screen = db.screen[profileId]?.[today()] ?? {};
  const screenTotal = Object.values(screen).reduce((a, b) => a + b, 0);

  // Mission du jour : déterministe sur la date + le profil, pour rester stable dans la journée.
  const list = subjects();
  const seedNum = [...today(), profileId].reduce((a, c) => a + c.charCodeAt(0), 0);
  const subject = list[seedNum % Math.max(list.length, 1)];
  const chapter = subject?.chapters[seedNum % Math.max(subject.chapters.length, 1)];
  const doneKey = `academie.mission.${profileId}.${today()}`;
  const done = localStorage.getItem(doneKey) === "1";

  return {
    weekday,
    date: today(),
    slots,
    screen_seconds_today: screenTotal,
    mission_text: subject ? MISSION_TEXT[subject.id] ?? `Un quiz de ${subject.name} t'attend.` : "Explore l'Académie !",
    mission_done: done,
    mission_subject_id: subject?.id ?? null,
    mission_chapter_id: chapter?.id ?? null,
  };
}

function screenDays(profileId: string): ScreenDay[] {
  const days: ScreenDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const by = db.screen[profileId]?.[key] ?? {};
    days.push({ date: key, total_seconds: Object.values(by).reduce((a, b) => a + b, 0), by_subject: by });
  }
  return days;
}

function childStats(profile: Profile): ChildStats {
  const log = db.quizLog[profile.id] ?? [];
  const avg = log.length ? Math.round((log.reduce((a, q) => a + (q.score / Math.max(q.total, 1)) * 100, 0) / log.length) * 10) / 10 : 0;
  return {
    profile,
    quizzes_count: log.length,
    avg_score: avg,
    creations_count: db.creations.filter((c) => (c as Creation & { profile_id?: string }).profile_id === profile.id).length,
    screen_days: screenDays(profile.id),
  };
}

// ---------------------------------------------------------------------------
// Quiz local
// ---------------------------------------------------------------------------
type OpenQuiz = {
  id: string;
  profileId: string;
  subjectId: string;
  chapterId: string;
  questions: { id: string; type: "qcm" | "libre"; question: string; options: string[]; answer: string; why: string }[];
};
const openQuizzes = new Map<string, OpenQuiz>();

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuiz(profileId: string, subjectId: string, chapterId: string, count: number): QuizOut {
  const bank = QUESTION_BANK[chapterId] ?? QUESTION_BANK[`${subjectId}-${chapterId}`] ?? [];
  const picked = shuffle(bank).slice(0, Math.max(1, count));
  const questions = picked.map((s) => ({
    id: uid(),
    type: "qcm" as const,
    question: s.q,
    options: shuffle(s.options),
    answer: s.answer,
    why: s.why,
  }));
  // S'il manque des questions, on complète avec d'autres chapitres de la même matière.
  if (questions.length < count) {
    const subject = subjects().find((s) => s.id === subjectId);
    const extra = subject?.chapters.flatMap((c) => (c.id === chapterId ? [] : QUESTION_BANK[c.id] ?? [])) ?? [];
    for (const s of shuffle(extra).slice(0, count - questions.length)) {
      questions.push({ id: uid(), type: "qcm", question: s.q, options: shuffle(s.options), answer: s.answer, why: s.why });
    }
  }
  const quiz: OpenQuiz = { id: uid(), profileId, subjectId, chapterId, questions };
  openQuizzes.set(quiz.id, quiz);
  return { id: quiz.id, questions: questions.map(({ answer: _a, why: _w, ...q }) => q) };
}

function submitQuiz(quizId: string, answers: string[]): QuizResult {
  const quiz = openQuizzes.get(quizId);
  if (!quiz) throw new ApiError(404, { detail: "Quiz introuvable" });
  const profile = findProfile(quiz.profileId);
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9/.,%\s-]/g, "")
      .trim();

  const items: QuizItem[] = quiz.questions.map((q, i) => {
    const given = answers[i] ?? "";
    const correct = norm(given) === norm(q.answer);
    return { question: q.question, given, answer: q.answer, correct, explanation: q.why };
  });
  const score = items.filter((i) => i.correct).length;
  const total = items.length;
  const perfect = score === total;

  const xpGained = score * 10 + (perfect ? 10 : 0);
  const starsGained = perfect ? 3 : score >= total * 0.6 ? 2 : score > 0 ? 1 : 0;
  const crystalsGained = Math.max(0, Math.floor(score / 2));

  profile.xp += xpGained;
  profile.stars += starsGained;
  profile.crystals += crystalsGained;
  profile.subject_xp[quiz.subjectId] = (profile.subject_xp[quiz.subjectId] ?? 0) + xpGained;

  const newBadges: string[] = [];
  newBadges.push(...grantBadge(profile, "premier-pas"));
  if (perfect) newBadges.push(...grantBadge(profile, "sans-faute"));
  if (Object.keys(profile.subject_xp).length >= 4) newBadges.push(...grantBadge(profile, "exploratrice"));

  const log = db.quizLog[profile.id] ?? [];
  log.push({ score, total });
  db.quizLog[profile.id] = log;
  const last3 = log.slice(-3);
  if (last3.length === 3 && last3.every((q) => q.score / Math.max(q.total, 1) >= 0.8)) {
    newBadges.push(...grantBadge(profile, "serie-3"));
  }

  const normalized = normalize(profile);
  Object.assign(profile, normalized);
  if (normalized.level >= 3) newBadges.push(...grantBadge(profile, "niveau-3"));

  if (perfect) localStorage.setItem(`academie.mission.${profile.id}.${today()}`, "1");
  save();
  return { score, total, xp_gained: xpGained, stars_gained: starsGained, crystals_gained: crystalsGained, new_badges: [...new Set(newBadges)], items };
}

// ---------------------------------------------------------------------------
// Professeur magique
//   · si une clé API est configurée dans l'app (Paramètres → clé fournisseur),
//     la question est envoyée au vrai modèle de langage ;
//   · sinon, réponse locale construite à partir des fiches et des chapitres.
// ---------------------------------------------------------------------------
const TEACHER_SYSTEM = SOCRATIC_SYSTEM;

type ProviderConfig = { provider: string; model: string; apiKey: string };

const PROVIDER_KEY = "academie.ai.v1";

export function getAiConfig(): ProviderConfig {
  try {
    const raw = localStorage.getItem(PROVIDER_KEY);
    if (raw) return { provider: "openai", model: "gpt-4o-mini", apiKey: "", ...(JSON.parse(raw) as Partial<ProviderConfig>) };
  } catch { /* ignore */ }
  return { provider: "openai", model: "gpt-4o-mini", apiKey: "" };
}

export function setAiConfig(cfg: Partial<ProviderConfig>) {
  localStorage.setItem(PROVIDER_KEY, JSON.stringify({ ...getAiConfig(), ...cfg }));
}

/** Appelle réellement le modèle. Renvoie null si aucune clé n'est configurée. */
async function askModel(step: "probe" | "hint" | "explain", message: string, subjectName: string | null, profile: Profile, history: ChatMessage[]): Promise<string | null> {
  const { provider, model, apiKey } = getAiConfig();
  if (!apiKey) return null;

  const endpoints: Record<string, { url: string; headers: Record<string, string> }> = {
    openai: { url: "https://api.openai.com/v1/chat/completions", headers: { Authorization: `Bearer ${apiKey}` } },
    mistral: { url: "https://api.mistral.ai/v1/chat/completions", headers: { Authorization: `Bearer ${apiKey}` } },
    groq: { url: "https://api.groq.com/openai/v1/chat/completions", headers: { Authorization: `Bearer ${apiKey}` } },
  };
  const ep = endpoints[provider] ?? endpoints.openai;

  const context = (subjectName ? `\nMatière en cours : ${subjectName}.` : "") +
    `\nÉtape imposée pour ce message : ${
      step === "probe" ? "PREMIER contact — pose une question, ne donne AUCUNE réponse ni indice." :
      step === "hint" ? "l'élève demande de l'aide — donne UN seul indice, sans la réponse." :
      "l'élève a cherché — donne maintenant l'explication complète, pas à pas."
    }`;
  const body = {
    model,
    temperature: 0.6,
    max_tokens: 600,
    messages: [
      { role: "system", content: TEACHER_SYSTEM + context + `\nL'élève s'appelle ${profile.name}.` },
      ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ],
  };

  try {
    const res = await fetch(ep.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ep.headers },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.warn("[Dame Morgane] appel IA refusé :", res.status, detail.slice(0, 200));
      return null;
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text && text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Routeur
// ---------------------------------------------------------------------------
function routeGet(path: string, query: URLSearchParams): unknown {
  if (path === "/profiles") return db.profiles.map((p) => normalize(p));
  let m: RegExpMatchArray | null;
  if ((m = path.match(/^\/profiles\/([^/]+)$/))) return normalize(findProfile(m[1]));
  if (path === "/subjects") return subjects();
  if ((m = path.match(/^\/subjects\/([^/]+)$/))) {
    const s = subjects().find((x) => x.id === m![1]);
    if (!s) throw new ApiError(404, { detail: "Matière introuvable" });
    return s;
  }
  if (path === "/badges") return BADGES as BadgeDef[];
  // ---- Bibliothèque (livres)
  if (path === "/books") {
    const sid = query.get("subject_id");
    return sid ? LIBRARY_BOOKS.filter((x) => x.subject_id === sid) : LIBRARY_BOOKS;
  }
  if ((m = path.match(/^\/books\/([^/]+)$/))) {
    const book = LIBRARY_BOOKS.find((x) => x.id === m![1]);
    if (!book) throw new ApiError(404, { detail: "Livre introuvable" });
    return book;
  }
  if (path === "/sheets") {
    const sid = query.get("subject_id");
    return sid ? db.sheets.filter((s) => s.subject_id === sid) : db.sheets;
  }
  if (path === "/quests") return db.quests;
  if (path === "/timetable") return db.timetable;
  if ((m = path.match(/^\/profiles\/([^/]+)\/today$/))) return todayView(m[1]);
  if ((m = path.match(/^\/profiles\/([^/]+)\/creations$/))) {
    const pid = m[1];
    return db.creations.filter((c) => (c as Creation & { profile_id?: string }).profile_id === pid);
  }
  if ((m = path.match(/^\/profiles\/([^/]+)\/screen-time$/))) return screenDays(m[1]);
  if ((m = path.match(/^\/chat\/([^/]+)$/))) return db.chat[m[1]] ?? [];
  if (path === "/parent/status") return { unlocked: db.parentUnlocked } as ParentStatus;
  if (path === "/parent/stats") {
    if (!db.parentUnlocked) throw new ApiError(401, { detail: "Espace parent verrouillé" });
    return db.profiles.map((p) => childStats(normalize(p)));
  }
  throw new ApiError(404, { detail: `Route inconnue : GET ${path}` });
}

async function routeWrite(method: string, path: string, body: unknown): Promise<unknown> {
  let m: RegExpMatchArray | null;
  const b = (body ?? {}) as Record<string, unknown>;

  // ---- Quiz
  if (path === "/quiz/generate" && method === "POST") {
    return generateQuiz(String(b.profile_id), String(b.subject_id), String(b.chapter_id), Number(b.count ?? 5));
  }
  if ((m = path.match(/^\/quiz\/([^/]+)\/submit$/)) && method === "POST") {
    return submitQuiz(m[1], (b.answers as string[]) ?? []);
  }
  // Fin d'un quiz de lecture : mêmes récompenses que le quiz classique
  if (path === "/reading/submit" && method === "POST") {
    const p = findProfile(String(b.profile_id));
    const score = Number(b.score ?? 0);
    const total = Number(b.total ?? 1);
    const subjectId = String(b.subject_id);
    const gained = Math.round((score / Math.max(total, 1)) * 10) + 3;
    p.xp += gained;
    p.stars += score;
    p.subject_xp[subjectId] = (p.subject_xp[subjectId] ?? 0) + gained;
    const log = db.quizLog[p.id] ?? [];
    log.push({ score, total });
    db.quizLog[p.id] = log;
    Object.assign(p, normalize(p));
    save();
    return { score, total, xp_gained: gained };
  }

  // ---- Profils
  if (path === "/profiles" && method === "POST") {
    const inp = b as unknown as ProfileIn;
    const p = normalize({
      id: uid(),
      name: inp.name,
      avatar: inp.avatar,
      level: 1,
      level_title: levelTitle(1),
      xp: 0,
      xp_in_level: 0,
      xp_for_next: 100,
      stars: 0,
      crystals: 0,
      badges: [],
      subject_xp: {},
      quest_progress: {},
    });
    db.profiles.push(p);
    save();
    return p;
  }
  if ((m = path.match(/^\/profiles\/([^/]+)$/))) {
    const p = findProfile(m[1]);
    if (method === "PUT") {
      const inp = b as unknown as ProfileIn;
      p.name = inp.name;
      p.avatar = inp.avatar;
      save();
      return normalize(p);
    }
    if (method === "DELETE") {
      if (!db.parentUnlocked) throw new ApiError(401, { detail: "Espace parent verrouillé" });
      db.profiles = db.profiles.filter((x) => x.id !== p.id);
      save();
      return ok;
    }
  }
  if ((m = path.match(/^\/profiles\/([^/]+)\/avatar$/)) && method === "PUT") {
    const p = findProfile(m[1]);
    p.avatar = b as unknown as Avatar;
    save();
    return normalize(p);
  }
  if ((m = path.match(/^\/profiles\/([^/]+)\/heartbeat$/)) && method === "POST") {
    const pid = m[1];
    const seconds = Number(b.seconds ?? 30);
    const subject = String(b.subject_id ?? "general");
    const day = today();
    db.screen[pid] = db.screen[pid] ?? {};
    db.screen[pid][day] = db.screen[pid][day] ?? {};
    db.screen[pid][day][subject] = (db.screen[pid][day][subject] ?? 0) + seconds;
    save();
    return ok;
  }

  // ---- Créations
  if ((m = path.match(/^\/profiles\/([^/]+)\/creations$/)) && method === "POST") {
    const pid = m[1];
    const inp = b as unknown as CreationIn;
    const c: Creation & { profile_id: string } = {
      id: uid(),
      kind: inp.kind,
      title: inp.title,
      content: inp.content,
      created_at: new Date().toISOString(),
      profile_id: pid,
    };
    db.creations = [c, ...db.creations];
    const p = findProfile(pid);
    p.xp += 10;
    Object.assign(p, normalize(p));
    grantBadge(p, inp.kind === "dessin" ? "artiste" : "plume");
    save();
    return c;
  }
  if ((m = path.match(/^\/profiles\/([^/]+)\/creations\/([^/]+)$/)) && method === "DELETE") {
    db.creations = db.creations.filter((c) => c.id !== m![2]);
    save();
    return ok;
  }

  // ---- Quêtes
  if ((m = path.match(/^\/profiles\/([^/]+)\/quests\/([^/]+)\/start$/)) && method === "POST") {
    const p = findProfile(m[1]);
    if (!(m[2] in p.quest_progress)) p.quest_progress[m[2]] = 0;
    save();
    return normalize(p);
  }
  if ((m = path.match(/^\/profiles\/([^/]+)\/quests\/([^/]+)\/answer$/)) && method === "POST") {
    const p = findProfile(m[1]);
    const quest = db.quests.find((q) => q.id === m![2]);
    if (!quest) throw new ApiError(404, { detail: "Quête introuvable" });
    const done = p.quest_progress[quest.id] ?? 0;
    const step = quest.steps[done];
    if (!step) throw new ApiError(400, { detail: "Quête déjà terminée" });
    const given = String(b.answer ?? "").trim();
    const accepted = step.answer
      ? step.answer
          .toLowerCase()
          .split("|")
          .map((a) => a.trim())
          .includes(given.toLowerCase())
      : true;
    let completed = false;
    if (accepted) {
      p.quest_progress[quest.id] = done + 1;
      p.xp += 15;
      if (done + 1 >= quest.steps.length) {
        completed = true;
        p.stars += quest.reward_stars;
        grantBadge(p, "quete-1");
      }
      Object.assign(p, normalize(p));
      save();
    }
    const out: QuestAnswerOut = { correct: accepted, completed, profile: normalize(p) };
    return out;
  }
  if (path === "/quests" && method === "POST") {
    const q: Quest = { id: uid(), ...(b as unknown as QuestIn) };
    db.quests.push(q);
    save();
    return q;
  }
  if ((m = path.match(/^\/quests\/([^/]+)$/))) {
    if (method === "PUT") {
      const i = db.quests.findIndex((q) => q.id === m![1]);
      if (i >= 0) db.quests[i] = { ...db.quests[i], ...(b as unknown as QuestIn) };
      save();
      return db.quests[i];
    }
    if (method === "DELETE") {
      db.quests = db.quests.filter((q) => q.id !== m![1]);
      save();
      return ok;
    }
  }

  // ---- Matières & chapitres
  if (path === "/subjects" && method === "POST") {
    const s: Subject = { id: uid(), chapters: [], ...(b as unknown as SubjectIn) };
    db.subjects.push(s);
    save();
    return s;
  }
  if ((m = path.match(/^\/subjects\/([^/]+)$/))) {
    const s = db.subjects.find((x) => x.id === m![1]);
    if (!s) throw new ApiError(404, { detail: "Matière introuvable" });
    if (method === "PUT") {
      Object.assign(s, b as unknown as SubjectIn);
      save();
      return s;
    }
    if (method === "DELETE") {
      db.subjects = db.subjects.filter((x) => x.id !== s.id);
      save();
      return ok;
    }
  }
  if ((m = path.match(/^\/subjects\/([^/]+)\/chapters$/)) && method === "POST") {
    const s = db.subjects.find((x) => x.id === m![1]);
    if (!s) throw new ApiError(404, { detail: "Matière introuvable" });
    const inp = b as unknown as ChapterIn;
    s.chapters.push({ id: uid(), title: inp.title, description: inp.description });
    save();
    return s;
  }
  if ((m = path.match(/^\/subjects\/([^/]+)\/chapters\/([^/]+)$/)) && method === "PUT") {
    const s = db.subjects.find((x) => x.id === m![1]);
    const c = s?.chapters.find((x) => x.id === m![2]);
    if (!s || !c) throw new ApiError(404, { detail: "Chapitre introuvable" });
    Object.assign(c, b as unknown as ChapterIn);
    save();
    return s;
  }
  if ((m = path.match(/^\/subjects\/([^/]+)\/chapters\/([^/]+)$/)) && method === "DELETE") {
    const s = db.subjects.find((x) => x.id === m![1]);
    if (!s) throw new ApiError(404, { detail: "Matière introuvable" });
    s.chapters = s.chapters.filter((x) => x.id !== m![2]);
    save();
    return s;
  }

  // ---- Fiches
  if (path === "/sheets" && method === "POST") {
    const s: Sheet = { id: uid(), ...(b as unknown as SheetIn) };
    db.sheets.push(s);
    save();
    return s;
  }
  if ((m = path.match(/^\/sheets\/([^/]+)$/))) {
    const i = db.sheets.findIndex((s) => s.id === m![1]);
    if (i < 0) throw new ApiError(404, { detail: "Fiche introuvable" });
    if (method === "PUT") {
      db.sheets[i] = { ...db.sheets[i], ...(b as unknown as SheetIn) };
      save();
      return db.sheets[i];
    }
    if (method === "DELETE") {
      db.sheets.splice(i, 1);
      save();
      return ok;
    }
  }

  // ---- Emploi du temps
  if (path === "/timetable" && method === "POST") {
    const s: Slot = { id: uid(), ...(b as unknown as SlotIn) };
    db.timetable.push(s);
    save();
    return s;
  }
  if ((m = path.match(/^\/timetable\/([^/]+)$/)) && method === "DELETE") {
    db.timetable = db.timetable.filter((s) => s.id !== m![1]);
    save();
    return ok;
  }

  // ---- Professeur (réponse locale, découpée pour l'effet « streaming »)
  if (path === "/chat/stream" && method === "POST") {
    const pid = String(b.profile_id);
    const p = findProfile(pid);
    const message = String(b.message ?? "");
    const subjectId = (b.subject_id as string | null) ?? null;
    const previous = db.chat[pid] ?? [];
    const subjectName = subjectId ? subjects().find((s) => s.id === subjectId)?.name ?? null : null;
    const said = previous.filter((m) => m.role === "user").map((m) => m.content);
    const lastReply = [...previous].reverse().find((m) => m.role === "assistant")?.content ?? "";
    const memory = { tried: said.length > 0, hinted: /indice/i.test(lastReply) };
    const step = stepOf(previous, message, memory);
    const local =
      step === "explain"
        ? fullExplanation(message, subjectId, subjects(), db.sheets, p, QUESTION_BANK)
        : step === "hint"
          ? `${giveHint(message, subjectId, subjects(), db.sheets, QUESTION_BANK)}`
          : probeQuestion(message, p);
    const reply = (await askModel(step, message, subjectName, p, previous)) ?? local;
    const list = db.chat[pid] ?? [];
    list.push({ id: uid(), role: "user", content: message, created_at: new Date().toISOString() });
    list.push({ id: uid(), role: "assistant", content: reply, created_at: new Date().toISOString() });
    db.chat[pid] = list;
    save();
    return { reply };
  }
  if ((m = path.match(/^\/chat\/([^/]+)$/)) && method === "DELETE") {
    db.chat[m[1]] = [];
    save();
    return ok;
  }

  // ---- Espace parent
  if (path === "/parent/unlock" && method === "POST") {
    if (String(b.pin) !== db.parentPin) throw new ApiError(401, { detail: "Code incorrect" });
    db.parentUnlocked = true;
    save();
    return { unlocked: true } as ParentStatus;
  }
  if (path === "/parent/lock" && method === "POST") {
    db.parentUnlocked = false;
    save();
    return ok;
  }
  if (path === "/parent/pin" && method === "POST") {
    if (!db.parentUnlocked) throw new ApiError(401, { detail: "Espace parent verrouillé" });
    if (String(b.current_pin) !== db.parentPin) throw new ApiError(401, { detail: "Code actuel incorrect" });
    const next = String(b.new_pin ?? "");
    if (!/^\d{4,8}$/.test(next)) throw new ApiError(422, { detail: "Le nouveau code doit contenir 4 à 8 chiffres" });
    db.parentPin = next;
    save();
    return ok;
  }

  throw new ApiError(404, { detail: `Route inconnue : ${method} ${path}` });
}

// ---------------------------------------------------------------------------
// Client public
// ---------------------------------------------------------------------------
function delay(ms = 90) {
  return new Promise((r) => setTimeout(r, ms));
}

async function call<T>(method: string, fullPath: string, body?: unknown): Promise<T> {
  const [path, qs] = fullPath.split("?");
  const query = new URLSearchParams(qs ?? "");
  await delay();
  const out = method === "GET" ? routeGet(path, query) : await routeWrite(method, path, body);
  // Clonage : les pages ne doivent jamais muter l'état du magasin directement.
  return JSON.parse(JSON.stringify(out ?? null)) as T;
}

export const apiGet = <T>(path: string) => call<T>("GET", path);
export const apiPost = <T>(path: string, body?: unknown) => call<T>("POST", path, body ?? null);
export const apiPut = <T>(path: string, body?: unknown) => call<T>("PUT", path, body ?? null);
export const apiPatch = <T>(path: string, body?: unknown) => call<T>("PATCH", path, body ?? null);
export const apiDelete = <T>(path: string) => call<T>("DELETE", path);

/** Même signature que le client SSE d'origine : on découpe la réponse locale en petits morceaux. */
export async function apiStream(path: string, body: unknown, onDelta: (text: string) => void): Promise<void> {
  const res = await call<{ reply: string }>("POST", path, body);
  const chunks = res.reply.match(/[\s\S]{1,6}/g) ?? [];
  for (const chunk of chunks) {
    onDelta(chunk);
    await delay(12);
  }
}

/** Réinitialise l'Académie (profils, progression, contenus ajoutés). */
export function resetAcademy() {
  db = seed();
  save();
}
