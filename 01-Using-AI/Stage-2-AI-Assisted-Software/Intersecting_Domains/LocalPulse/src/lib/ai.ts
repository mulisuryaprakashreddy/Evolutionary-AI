// AI service — uses a user-supplied API key (OpenAI-compatible).
// The key is stored only in the browser (localStorage) and sent directly
// to the provider. It is never stored in the database or sent to our servers.

const KEY_STORAGE = 'localpulse_ai_api_key';
const MODEL_STORAGE = 'localpulse_ai_model';
const BASE_URL_STORAGE = 'localpulse_ai_base_url';

export const DEFAULT_MODEL = 'gpt-4o-mini';
export const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

export function getApiKey(): string | null {
  return localStorage.getItem(KEY_STORAGE);
}

export function setApiKey(key: string) {
  if (key.trim()) localStorage.setItem(KEY_STORAGE, key.trim());
  else localStorage.removeItem(KEY_STORAGE);
}

export function getModel(): string {
  return localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL;
}

export function setModel(model: string) {
  localStorage.setItem(MODEL_STORAGE, model);
}

export function getBaseUrl(): string {
  return localStorage.getItem(BASE_URL_STORAGE) || DEFAULT_BASE_URL;
}

export function setBaseUrl(url: string) {
  localStorage.setItem(BASE_URL_STORAGE, url || DEFAULT_BASE_URL);
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

export interface ChatMsg {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CompletionOptions {
  messages: ChatMsg[];
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}

async function completion(opts: CompletionOptions): Promise<string> {
  const key = getApiKey();
  if (!key) throw new Error('No AI API key configured. Add one in AI Settings.');

  const baseUrl = getBaseUrl();
  const model = getModel();

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 700,
      ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const errBody = await res.json();
      detail = errBody?.error?.message || '';
    } catch {
      /* ignore */
    }
    throw new Error(`AI request failed (${res.status}). ${detail}`.trim());
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI returned an empty response.');
  return content as string;
}

function safeParseJson<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        /* fall through */
      }
    }
    throw new Error('AI returned malformed JSON.');
  }
}

const BASE_SYSTEM = `You are LocalPulse AI, the intelligence engine for a global community problem reporting platform. You analyze citizen reports about local issues (water, roads, waste, flooding, electricity, etc.) and produce clear, evidence-based insights. Always distinguish AI recommendations from official decisions. Be concise, specific, and grounded in the provided data. Do not invent statistics not present in the input.`;

export async function summarizeReport(report: {
  title: string; category: string; description: string;
  severity: string; city: string; country: string; status: string;
  people_affected: number; votes_count: number; recurrence: string;
}): Promise<string> {
  const user = `Summarize this community report in 2-3 sentences for a public audience. Note its likely impact and urgency.\n\nTitle: ${report.title}\nCategory: ${report.category}\nSeverity: ${report.severity}\nStatus: ${report.status}\nLocation: ${report.city}, ${report.country}\nPeople affected: ~${report.people_affected}\nRecurrence: ${report.recurrence}\nCommunity votes: ${report.votes_count}\nDescription: ${report.description}`;
  return completion({ messages: [{ role: 'system', content: BASE_SYSTEM }, { role: 'user', content: user }], maxTokens: 250 });
}

export async function suggestSolutions(report: {
  title: string; category: string; description: string; severity: string; recurrence: string;
}): Promise<string[]> {
  const user = `Suggest 4-6 practical actions to address this community problem. Return ONLY a JSON object: {"solutions":["...","..."]}. These are recommendations, not official decisions.\n\nTitle: ${report.title}\nCategory: ${report.category}\nSeverity: ${report.severity}\nRecurrence: ${report.recurrence}\nDescription: ${report.description}`;
  const raw = await completion({ messages: [{ role: 'system', content: BASE_SYSTEM }, { role: 'user', content: user }], json: true, maxTokens: 400 });
  return safeParseJson<{ solutions: string[] }>(raw).solutions;
}

export interface ClusterInfo {
  title: string;
  summary: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export async function clusterReports(reports: {
  title: string; category: string; city: string; description: string; severity: string;
}[]): Promise<ClusterInfo[]> {
  if (reports.length === 0) return [];
  const user = `Group these community reports into clusters of similar issues. Merge duplicates. Return ONLY JSON: {"clusters":[{"title":"...","summary":"1 sentence","priority":"critical|high|medium|low"}]}. Max 6 clusters.\n\nReports:\n${JSON.stringify(reports.slice(0, 40))}`;
  const raw = await completion({ messages: [{ role: 'system', content: BASE_SYSTEM }, { role: 'user', content: user }], json: true, maxTokens: 800 });
  return safeParseJson<{ clusters: ClusterInfo[] }>(raw).clusters;
}

export interface CommunityInsight {
  summary: string;
  strengths: string[];
  concerns: string[];
}

export async function communityInsights(reports: {
  title: string; category: string; severity: string; city: string;
  status: string; people_affected: number;
}[]): Promise<CommunityInsight> {
  if (reports.length === 0) {
    return { summary: 'No reports yet for this area.', strengths: [], concerns: [] };
  }
  const user = `Analyze these community reports and produce insights. Return ONLY JSON: {"summary":"2-3 sentence plain-language overview","strengths":["..."],"concerns":["..."]}.\n\nReports:\n${JSON.stringify(reports.slice(0, 50))}`;
  const raw = await completion({ messages: [{ role: 'system', content: BASE_SYSTEM }, { role: 'user', content: user }], json: true, maxTokens: 600 });
  return safeParseJson<CommunityInsight>(raw);
}

export interface HealthExplanation {
  summary: string;
  strengths: string[];
  needs_improvement: string[];
}

export async function explainHealthScore(input: {
  score: number; city: string; topCategories: string[];
  resolvedRatio: number; totalReports: number; peopleAffected: number;
}): Promise<HealthExplanation> {
  const user = `Explain a Community Health Score. Return ONLY JSON: {"summary":"2-3 sentences","strengths":["..."],"needs_improvement":["..."]}.\n\nScore: ${input.score}/100\nCity: ${input.city}\nTotal reports: ${input.totalReports}\nResolved ratio: ${Math.round(input.resolvedRatio * 100)}%\nPeople affected: ~${input.peopleAffected}\nTop problem categories: ${input.topCategories.join(', ')}`;
  const raw = await completion({ messages: [{ role: 'system', content: BASE_SYSTEM }, { role: 'user', content: user }], json: true, maxTokens: 500 });
  return safeParseJson<HealthExplanation>(raw);
}

export async function chat(history: ChatMsg[], context?: string): Promise<string> {
  const messages: ChatMsg[] = [
    { role: 'system', content: BASE_SYSTEM + (context ? `\n\nCommunity report context (use as evidence):\n${context}` : '') },
    ...history,
  ];
  return completion({ messages, maxTokens: 600 });
}

export async function generateThreadTitle(firstMessage: string): Promise<string> {
  const user = `Generate a short title (max 6 words) for a chat conversation that starts with this message. Return ONLY the title text, no quotes.\n\nMessage: ${firstMessage}`;
  const raw = await completion({ messages: [{ role: 'system', content: 'You generate concise titles.' }, { role: 'user', content: user }], maxTokens: 20, temperature: 0.2 });
  return raw.replace(/["'\n]/g, '').trim().slice(0, 60);
}
