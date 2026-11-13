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
    model: "gemini-3-flash-preview",
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

async function post(url: string, headers: Record<string, string>, body: unknown, timeoutMs = 20000): Promise<unknown | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      lastDetail = `HTTP ${res.status} · ${detail.replace(/\s+/g, " ").slice(0, 220)}`;
      console.warn("[Dame Morgane] appel IA refusé :", res.status, detail);
      // Le message renvoyé par Google est plus précis que le code : on le garde.
      let apiMsg = "";
      try {
        apiMsg = (JSON.parse(detail) as { error?: { message?: string; status?: string } }).error?.message ?? "";
      } catch { /* pas de JSON : on garde le texte brut */ }
      const lower = `${apiMsg} ${detail}`.toLowerCase();
      const msgs: Record<number, string> = {
        400: "Clé refusée ou requête invalide : vérifie la clé et le nom du modèle.",
        401: "Clé refusée : elle est peut-être mal copiée ou supprimée.",
        403: "Accès refusé : la clé n'a pas le droit d'utiliser ce modèle.",
        404: "Modèle introuvable : change le nom du modèle (ex. gemini-2.5-flash).",
        429: "Quota gratuit atteint : réessaie dans une minute.",
        500: "Le serveur de Google a eu un problème interne : réessaie dans quelques secondes.",
        503: "Google est surchargé (503) : réessaie dans quelques secondes, ce n'est pas ta clé.",
        504: "Google n'a pas répondu à temps : réessaie dans quelques secondes.",
      };
      // Diagnostic précis d'après le texte de l'API (plus fiable que le code seul).
      if (/api key not valid|api_key_invalid|invalid api key/.test(lower)) {
        lastError = "Clé invalide : Google ne reconnaît pas cette clé. Vérifie qu'elle est complète (elle commence par AIza…) et qu'elle vient bien de aistudio.google.com/apikey.";
      } else if (/api key expired/.test(lower)) {
        lastError = "Clé expirée : crée une nouvelle clé sur aistudio.google.com/apikey.";
      } else if (/api key not allowed|permission|not authorized|denied/.test(lower)) {
        lastError = "Clé sans autorisation pour ce service : dans Google AI Studio, autorise l'API Generative Language pour ce projet.";
      } else if (/unexpected model name format/.test(lower)) {
        lastError = "Nom de modèle mal écrit : mets simplement gemini-3-flash-preview dans le champ Modèle.";
      } else if (/no longer available/.test(lower)) {
        lastError = "Ce modèle est fermé aux nouvelles clés : mets gemini-3-flash-preview dans le champ Modèle.";
      } else if (/not found|is not supported|unsupported model/.test(lower)) {
        lastError = "Modèle introuvable pour cette clé : mets gemini-2.5-flash dans le champ Modèle.";
      } else if (/quota|resource_exhausted/.test(lower)) {
        lastError = "Quota gratuit atteint : réessaie dans une minute (ou demain si le quota du jour est épuisé).";
      } else {
        lastError = apiMsg ? `${msgs[res.status] ?? `Erreur ${res.status}.`} Détail Google : ${apiMsg.slice(0, 160)}` : msgs[res.status] ?? `Erreur ${res.status} du fournisseur.`;
      }
      return null;
    }
    return await res.json();
  } catch (e) {
    const aborted = (e as { name?: string })?.name === "AbortError";
    lastError = aborted
      ? "Aucune réponse après 20 s : la connexion à Gemini est bloquée (pare-feu, antivirus ou réseau)."
      : "Impossible de joindre le fournisseur : vérifie la connexion Internet.";
    console.warn("[Dame Morgane] réseau indisponible :", e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Envoie la question au modèle configuré. Renvoie null si aucune clé ou en cas d'échec. */
/** Dernière erreur d'appel IA, pour l'afficher dans l'app. */
export let lastError: string | null = null;
/** Réponse brute du fournisseur lors du dernier appel, pour le diagnostic. */
export let lastDetail: string | null = null;

/** Teste la clé en posant une question minuscule. Renvoie un message prêt à afficher. */
export async function testAi(): Promise<{ ok: boolean; message: string }> {
  const cfg = getAiConfig();
  if (!cfg.apiKey.trim()) return { ok: false, message: "Aucune clé enregistrée." };
  lastError = null;
  // Course contre la montre : le test rend toujours la main, même si le réseau bloque.
  const limit = new Promise<null>((resolve) => setTimeout(() => resolve(null), 25000));
  const reply = await Promise.race([
    askModel("Réponds en un seul mot.", "Bonjour", { name: "Jana" } as Profile, []),
    limit,
  ]);
  if (reply) return { ok: true, message: `Ça marche ! ${cfg.provider === "gemini" ? "Gemini" : cfg.provider} a répondu : « ${reply.slice(0, 60)} »` };
  return {
    ok: false,
    message: `${lastError ?? "Aucune réponse du fournisseur (25 s)."}${lastDetail ? ` — réponse de Google : ${lastDetail}` : ""}`,
  };
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
    const wanted = cleanModel(cfg.model) || "gemini-3-flash-preview";
    const models = [wanted, "gemini-3-flash-preview", "gemini-flash-latest", "gemini-2.5-flash", "gemini-2.0-flash"].filter(
      (m, i, a) => m && a.indexOf(m) === i,
    );
    // 503/500 = serveur surchargé : on réessaie deux fois avec une pause.
    for (let attempt = 0; attempt < 3; attempt++) {
      for (const model of models) {
        const out = await geminiOnce(model, apiKey, sys, turns);
        if (out) return out;
        // Erreur définitive : clé refusée, quota, réseau bloqué → inutile d'insister.
        if (lastError && /Clé invalide|expirée|sans autorisation|Quota|Aucune réponse|Impossible de joindre/.test(lastError)) return null;
        // Sinon (modèle indisponible, surchargé, format inattendu) : on essaie le suivant.
      }
      if (!lastError || !/surchargé|interne|n'a pas répondu/.test(lastError)) return null;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
    }
    return null;
  }
  return await openAiCompatible(cfg.provider, apiKey, cfg.model, sys, turns);
}

/** Nettoie un nom de modèle : « models/gemini-2.5-flash », « Gemini 2.5 Flash » → « gemini-2.5-flash ». */
export function cleanModel(raw: string): string {
  return (raw ?? "")
    .trim()
    .replace(/^models\//i, "")
    .replace(/[:\s].*$/, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

async function geminiOnce(model: string, apiKey: string, sys: string, turns: Msg[]): Promise<string | null> {
  {
    const data = (await post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      { "x-goog-api-key": apiKey },
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
  const model = cleanModel(cfgModel) || PROVIDERS.find((p) => p.id === provider)?.model || "gpt-4o-mini";
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
