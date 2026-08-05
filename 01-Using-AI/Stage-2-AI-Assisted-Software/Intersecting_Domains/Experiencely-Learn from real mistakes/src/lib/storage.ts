const FINGERPRINT_KEY = "experiences_fingerprint";
const VOTED_KEY = "experiences_voted";
const SETTINGS_KEY = "experiences_settings";
const HISTORY_KEY = "experiences_history";

export function getFingerprint(): string {
  let fp = localStorage.getItem(FINGERPRINT_KEY);
  if (!fp) {
    fp =
      "fp_" +
      Math.random().toString(36).slice(2) +
      Date.now().toString(36);
    localStorage.setItem(FINGERPRINT_KEY, fp);
  }
  return fp;
}

export function getVoted(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(VOTED_KEY) || "{}");
  } catch {
    return {};
  }
}

export function setVoted(targetKey: string) {
  const voted = getVoted();
  voted[targetKey] = true;
  localStorage.setItem(VOTED_KEY, JSON.stringify(voted));
}

export function getApiKey(): string {
  return localStorage.getItem("openai_api_key") || "";
}

export function setApiKey(key: string) {
  localStorage.setItem("openai_api_key", key);
}

export function getLearningMode(): "beginner" | "intermediate" | "expert" {
  return (
    (localStorage.getItem("learning_mode") as "beginner" | "intermediate" | "expert") ||
    "beginner"
  );
}

export function setLearningMode(mode: "beginner" | "intermediate" | "expert") {
  localStorage.setItem("learning_mode", mode);
}

export function getLanguage(): string {
  return localStorage.getItem("app_language") || "en";
}

export function setLanguage(lang: string) {
  localStorage.setItem("app_language", lang);
}

export function getSettings(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToHistory(postId: string) {
  const history = getHistory().filter((id) => id !== postId);
  history.unshift(postId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}
