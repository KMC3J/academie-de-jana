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
    model: "gemini-2.5-flash",
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
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      console.warn("[Dame Morgane] appel IA refusé :", res.status, detail);
      lastError = res.status === 400 || res.status === 403 ? "Clé refusée par le fournisseur (vérifie la clé et le modèle)."
        : res.status === 404 ? "Modèle introuvable : change le nom du modèle (ex. gemini-2.0-flash)."
        : res.status === 429 ? "Quota gratuit atteint : réessaie dans une minute."
        : `Erreur ${res.status} du fournisseur.`;
      return null;
    }
    return await res.json();
  } catch (e) {
    console.warn("[Dame Morgane] réseau indisponible :", e);
    return null;
  }
}

/** Envoie la question au modèle configuré. Renvoie null si aucune clé ou en cas d'échec. */
/** Dernière erreur d'appel IA, pour l'afficher dans l'app. */
export let lastError: string | null = null;

/** Teste la clé en posant une question minuscule. Renvoie un message prêt à afficher. */
export async function testAi(): Promise<{ ok: boolean; message: string }> {
  const cfg = getAiConfig();
  if (!cfg.apiKey.trim()) return { ok: false, message: "Aucune clé enregistrée." };
  const before = lastError;
  const reply = await askModel("Réponds en un seul mot.", "Bonjour", { name: "Jana" } as Profile, []);
  if (reply) return { ok: true, message: `Ça marche ! Gemini a répondu : « ${reply.slice(0, 40)} »` };
  return { ok: false, message: lastError && lastError !== before ? lastError : "Le fournisseur n'a pas répondu. Vérifie la clé et la connexion." };
}

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
    // Modèles essayés dans l'ordre : si l'un n'existe plus, on bascule sur le suivant.
    const wanted = (cfg.model || "gemini-2.5-flash").trim();
    const models = [wanted, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"].filter(
      (m, i, a) => m && a.indexOf(m) === i,
    );
    for (const model of models) {
      const out = await geminiOnce(model, apiKey, sys, turns);
      if (out) return out;
    }
    return null;
  }
  return await openAiCompatible(cfg.provider, apiKey, cfg.model, sys, turns);
}

async function geminiOnce(model: string, apiKey: string, sys: string, turns: Msg[]): Promise<string | null> {
  {
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
}

async function openAiCompatible(
  provider: ProviderId,
  apiKey: string,
  cfgModel: string,
  sys: string,
  turns: Msg[],
): Promise<string | null> {
  const urls: Record<string, string> = {
    groq: "https://api.groq.com/openai/v1/chat/completions",
    openrouter: "https://openrouter.ai/api/v1/chat/completions",
    mistral: "https://api.mistral.ai/v1/chat/completions",
    openai: "https://api.openai.com/v1/chat/completions",
  };
  const url = urls[provider] ?? urls.openai;
  const model = cfgModel || PROVIDERS.find((p) => p.id === provider)?.model || "gpt-4o-mini";
  const headers: Record<string, string> = { Authorization: `Bearer ${apiKey}` };
  if (provider === "openrouter") {
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
