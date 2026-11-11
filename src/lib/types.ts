// Types miroirs de l'API d'origine (Pydantic côté FastAPI).
// Le clone fonctionne sans serveur : la couche lib/api.ts implémente ces mêmes
// structures au-dessus du localStorage, si bien que les pages n'ont pas bougé.

export type Ok = { ok: boolean };

export type Avatar = { icon: string; color: string };

export type Profile = {
  id: string;
  name: string;
  avatar: Avatar;
  level: number;
  level_title: string;
  xp: number;
  xp_in_level: number;
  xp_for_next: number;
  stars: number;
  crystals: number;
  badges: string[];
  subject_xp: Record<string, number>;
  quest_progress: Record<string, number>;
};

export type ProfileIn = { name: string; avatar: Avatar };

export type Chapter = { id: string; title: string; description: string };
export type ChapterIn = { title: string; description: string };

export type Subject = {
  id: string;
  name: string;
  magic_name: string;
  icon: string;
  color: string;
  order: number;
  chapters: Chapter[];
};

export type SubjectIn = {
  name: string;
  magic_name: string;
  icon: string;
  color: string;
  order: number;
};

export type BadgeDef = { id: string; title: string; description: string; icon: string };

export type Slot = {
  id: string;
  day: number;
  start: string;
  end: string;
  subject_id: string | null;
  label: string;
  room: string;
};

export type SlotIn = Omit<Slot, "id">;

export type TodayView = {
  weekday: number;
  date: string;
  slots: Slot[];
  screen_seconds_today: number;
  mission_text: string;
  mission_done: boolean;
  mission_subject_id: string | null;
  mission_chapter_id: string | null;
};

export type QuizQuestion = {
  id: string;
  type: "qcm" | "libre";
  question: string;
  options: string[];
};

export type QuizOut = { id: string; questions: QuizQuestion[] };

export type QuizItem = {
  question: string;
  given: string;
  answer: string;
  correct: boolean;
  explanation: string;
};

export type QuizResult = {
  score: number;
  total: number;
  xp_gained: number;
  stars_gained: number;
  crystals_gained: number;
  new_badges: string[];
  items: QuizItem[];
};

export type QuestStep = { title: string; question: string; answer: string };

export type Quest = {
  id: string;
  title: string;
  description: string;
  subject_id: string | null;
  steps: QuestStep[];
  reward_stars: number;
};

export type QuestIn = Omit<Quest, "id">;

export type QuestAnswerOut = { correct: boolean; completed: boolean; profile: Profile };

export type MindBranch = { label: string; items: string[] };

export type SheetKind = "methode" | "carte";

export type Sheet = {
  id: string;
  subject_id: string;
  kind: SheetKind;
  title: string;
  content: string;
  branches: MindBranch[];
};

export type SheetIn = Omit<Sheet, "id">;

export type CreationKind = "dessin" | "histoire" | "theatre";

export type Creation = {
  id: string;
  kind: CreationKind;
  title: string;
  content: string;
  created_at: string;
};

export type CreationIn = { kind: CreationKind; title: string; content: string };

export type ScreenDay = {
  date: string;
  total_seconds: number;
  by_subject: Record<string, number>;
};

export type ChatMessage = { id: string; role: "user" | "assistant"; content: string; created_at: string };

export type ParentStatus = { unlocked: boolean };

export type ChildStats = {
  profile: Profile;
  quizzes_count: number;
  avg_score: number;
  creations_count: number;
  screen_days: ScreenDay[];
};
