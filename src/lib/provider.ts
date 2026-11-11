import type { ChatMessage, Profile } from "@/lib/types";

// ---------------------------------------------------------------------------
// Appels aux fournisseurs d'IA, dont les paliers GRATUITS (sans carte bancaire) :
//   · Google Gemini (Google AI Studio) — clé gratuite
//   · Groq — clé gratuite
//   · Mistral — offre gratuite
//   · OpenRouter — modèles « :free »
//   · OpenAI / Mistral / Groq au choix si l'utilisateur a déjà une clé
// Si aucun appel n'aboutit, l'app répond avec ses leçons locales.
// ---------------------------------------------------------------------------

export type ProviderId = "gemini" | "groq" | "openrouter" | "mistral" | "openai";

export type AiConfig = { provider: ProviderId; model: string; apiKey: string };

export const PROVIDERS: {
  id: ProviderId;
  label: string;
  free: boolean;
  keyUrl: string;
  model: string;
  hint: string;
}[] = [
  {
    id: "gemini",
    label: "Google Gemini",
    free: true,
    keyUrl: "https://aistudio.google.com/apikey",
    model: "gemini-2.0-flash",
    hint: "Clé gratuite, sans carte bancaire (compte Google).",
  },
  {
    id: "groq",
    label: "Groq",
    free: true,
    keyUrl: "https://console.groq.com/keys",
    model: "llama-3.3-70b-versatile",
    hint: "Clé gratuite, sans carte bancaire.",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    free: true,
    keyUrl: "https://openrouter.ai/keys",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    hint: "Modèles marqués « :free », gratuits.",
  },
  {
    id: "mistral",
    label: "Mistral",
    free: true,
    keyUrl: "https://console.mistral.ai/api-keys",
    model: "mistral-small-latest",
    hint: "Palier gratuit disponible.",
  },
  { id: "openai", label: "OpenAI", free: false, keyUrl: "https://platform.openai.com/api-keys", model: "gpt-4o-mini", hint: "Payant." },
];

const KEY = "academie.ai.v2";

export function getAiConfig(): AiConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { provider: "gemini", model: PROVIDERS[0].model, apiKey: "", ...(JSON.parse(raw) as Partial<AiConfig>) };
  } catch {
    /* ignore */
  }
  return { provider: "gemini", model: PROVIDERS[0].model, apiKey: "" };
}

export function setAiConfig(cfg: Partial<AiConfig>) {
  localStorage.setItem(KEY, JSON.stringify({ ...getAiConfig(), ...cfg }));
}

export function isAiReady(): boolean {
  return getAiConfig().apiKey.trim().length > 0;
}

type Msg = { role: "user" | "assistant"; content: string };

async function post(url: string, headers: Record<string, string>, body: unknown): Promise<unknown | null> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
    if (!res.ok) {
      console.warn("[Dame Morgane] appel IA refusé :", res.status, (await res.text().catch(() => "")).slice(0, 200));
      return null;
    }
    return await res.json();
  } catch (e) {
    console.warn("[Dame Morgane] réseau indisponible :", e);
    return null;
  }
}

/** Envoie la question au modèle configuré. Renvoie null si aucune clé ou en cas d'échec. */
export async function askModel(
  system: string,
  message: string,
  profile: Profile,
  history: ChatMessage[],
): Promise<string | null> {
  const cfg = getAiConfig();
  const apiKey = cfg.apiKey.trim();
  if (!apiKey) return null;

  const turns: Msg[] = [
    ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: message },
  ];
  const sys = `${system}\nL'élève s'appelle ${profile.name}.`;

  if (cfg.provider === "gemini") {
    const model = cfg.model || "gemini-2.0-flash";
    const data = (await post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {},
      {
        systemInstruction: { parts: [{ text: sys }] },
        contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
      },
    )) as { candidates?: { content?: { parts?: { text?: string }[] } }[] } | null;
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
    return text || null;
  }

  const urls: Record<string, string> = {
    groq: "https://api.groq.com/openai/v1/chat/completions",
    openrouter: "https://openrouter.ai/api/v1/chat/completions",
    mistral: "https://api.mistral.ai/v1/chat/completions",
    openai: "https://api.openai.com/v1/chat/completions",
  };
  const url = urls[cfg.provider] ?? urls.openai;
  const model = cfg.model || PROVIDERS.find((p) => p.id === cfg.provider)?.model || "gpt-4o-mini";
  const headers: Record<string, string> = { Authorization: `Bearer ${apiKey}` };
  if (cfg.provider === "openrouter") {
    headers["HTTP-Referer"] = location.origin;
    headers["X-Title"] = "Academie de Jana";
  }
  const data = (await post(url, headers, {
    model,
    temperature: 0.7,
    max_tokens: 800,
    messages: [{ role: "system", content: sys }, ...turns],
  })) as { choices?: { message?: { content?: string } }[] } | null;
  const text = data?.choices?.[0]?.message?.content?.trim();
  return text || null;
}

// ---------------------------------------------------------------------------
// Modes de la professeure
// ---------------------------------------------------------------------------
export type TeacherMode = "lesson" | "socratic";

const MODE_KEY = "academie.teacher.mode";

export function getTeacherMode(): TeacherMode {
  return localStorage.getItem(MODE_KEY) === "socratic" ? "socratic" : "lesson";
}
export function setTeacherMode(mode: TeacherMode) {
  localStorage.setItem(MODE_KEY, mode);
}
