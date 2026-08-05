import { supabase } from "./supabase";
import { getApiKey, getLearningMode } from "./storage";
import type { AIResponse, Post, LearningMode } from "./types";

// Semantic keyword expansion maps — lets us find related concepts
// even without true vector embeddings (which would require a backend).
const SEMANTIC_MAP: Record<string, string[]> = {
  oven: ["baking", "bake", "roast", "roasting", "cook", "cooking", "kitchen", "preheat", "temperature", "burn", "burned", "food"],
  baking: ["oven", "bake", "bread", "cookies", "cake", "pastry", "flour", "yeast", "cook", "cooking"],
  cooking: ["kitchen", "oven", "baking", "recipe", "food", "burn", "stove", "cook", "chef", "meal"],
  programming: ["coding", "code", "software", "development", "developer", "debug", "debugging", "java", "python", "javascript", "git", "ide", "compiler"],
  coding: ["programming", "code", "software", "developer", "debug", "debugging", "java", "python", "git"],
  java: ["programming", "coding", "object", "class", "method", "compiler", "jvm", "string", "collections", "generics"],
  python: ["programming", "coding", "script", "scripting", "list", "dict", "exception", "debug"],
  git: ["version control", "commit", "push", "merge", "branch", "rebase", "reflog", "repository"],
  travel: ["trip", "vacation", "abroad", "international", "flight", "packing", "luggage", "hotel", "passport", "currency"],
  packing: ["luggage", "suitcase", "travel", "trip", "carry-on", "clothes", "essentials"],
  finance: ["money", "investing", "investment", "stocks", "budget", "budgeting", "savings", "debt", "credit", "expenses"],
  investing: ["stocks", "stock", "index funds", "portfolio", "market", "dividend", "dollar cost averaging", "panic sell", "finance"],
  stocks: ["investing", "investment", "portfolio", "market", "shares", "dividend", "finance", "trading"],
  budgeting: ["budget", "money", "savings", "expenses", "subscriptions", "spending", "finance"],
  career: ["job", "interview", "work", "workplace", "office", "professional", "resume", "hire", "manager"],
  interview: ["job", "career", "hire", "recruiter", "questions", "offer", "resume", "interviewer"],
  diy: ["home", "renovation", "repair", "tools", "plumbing", "tiling", "project", "house"],
  renovation: ["diy", "home", "bathroom", "kitchen", "remodel", "tiles", "plumbing", "demolition"],
  gaming: ["pc", "build", "hardware", "gpu", "cpu", "ram", "overclock", "games", "computer"],
  "gaming pc": ["pc", "build", "hardware", "gpu", "cpu", "ram", "motherboard", "thermal paste", "case"],
  overclocking: ["cpu", "voltage", "bios", "thermal", "cooling", "stability", "gaming", "hardware"],
  health: ["fitness", "gym", "diet", "nutrition", "weight", "exercise", "injury", "workout", "calories"],
  fitness: ["gym", "workout", "exercise", "lifting", "injury", "form", "warm up", "health"],
  diet: ["nutrition", "calories", "weight loss", "food", "fats", "protein", "health", "eating"],
  vehicles: ["car", "driving", "drone", "used car", "maintenance", "inspection", "engine"],
  car: ["vehicle", "used car", "buying", "maintenance", "inspection", "dealership", "financing"],
  drone: ["flying", "dji", "battery", "propeller", "crash", "firmware", "compass", "gps"],
  business: ["startup", "entrepreneur", "small business", "pricing", "inventory", "marketing", "sales", "customer"],
  startup: ["business", "entrepreneur", "funding", "product", "market", "launch", "customer"],
  "small business": ["business", "pricing", "inventory", "marketing", "taxes", "customer", "startup"],
  bread: ["baking", "yeast", "flour", "knead", "dough", "rise", "loaf", "sourdough"],
};

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "i", "im", "my", "me", "we",
  "what", "how", "do", "does", "should", "can", "could", "would", "will",
  "to", "of", "in", "on", "for", "with", "and", "or", "but", "not", "from",
  "while", "during", "before", "after", "about", "into", "that", "this",
  "these", "those", "it", "its", "be", "been", "have", "has", "had",
  "you", "your", "they", "their", "he", "she", "his", "her", "first",
  "time", "when", "where", "which", "who", "whom", "if", "then", "than",
  "so", "as", "at", "by", "up", "out", "off", "over", "under", "again",
  "mistakes", "mistake", "avoid", "wrong", "goes", "know", "learn",
  "using", "use", "get", "got", "make", "made", "start", "starting",
  "people", "person", "thing", "things", "help", "helps",
]);

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function expandTerms(tokens: string[]): string[] {
  const expanded = new Set<string>(tokens);
  for (const token of tokens) {
    const related = SEMANTIC_MAP[token];
    if (related) {
      related.forEach((r) => expanded.add(r));
    }
  }
  // Also try multi-word phrases from the original query
  const lower = tokens.join(" ");
  for (const key of Object.keys(SEMANTIC_MAP)) {
    if (lower.includes(key)) {
      SEMANTIC_MAP[key].forEach((r) => expanded.add(r));
    }
  }
  return Array.from(expanded);
}

export type SearchResult = {
  post: Post;
  score: number;
  matchedTerms: string[];
};

export async function semanticSearch(query: string, limit = 20): Promise<SearchResult[]> {
  const tokens = tokenize(query);
  const expanded = expandTerms(tokens);

  // Build a full-text search query using the original tokens (not all expanded)
  const ftsQuery = tokens.map((t) => `${t}:*`).join(" | ");

  // Fetch candidates via full-text search OR tag/mistake overlap OR all posts (fallback)
  let candidates: Post[] = [];

  // 1. Try full-text search
  if (ftsQuery) {
    const { data } = await supabase
      .from("posts")
      .select("*, category:categories(*)")
      .textSearch("search_vector", ftsQuery)
      .order("helpful_count", { ascending: false })
      .limit(limit * 2);
    if (data && data.length > 0) candidates = data as Post[];
  }

  // 2. If too few, fetch by tag overlap
  if (candidates.length < limit && expanded.length > 0) {
    const { data } = await supabase
      .from("posts")
      .select("*, category:categories(*)")
      .overlaps("tags", expanded)
      .order("helpful_count", { ascending: false })
      .limit(limit * 2);
    if (data) {
      const existing = new Set(candidates.map((p) => p.id));
      data.forEach((p) => {
        if (!existing.has((p as Post).id)) candidates.push(p as Post);
      });
    }
  }

  // 3. If still too few, fetch top posts overall
  if (candidates.length < 5) {
    const { data } = await supabase
      .from("posts")
      .select("*, category:categories(*)")
      .order("helpful_count", { ascending: false })
      .limit(limit * 2);
    if (data) {
      const existing = new Set(candidates.map((p) => p.id));
      data.forEach((p) => {
        if (!existing.has((p as Post).id)) candidates.push(p as Post);
      });
    }
  }

  // Score each candidate
  const lowerExpanded = expanded.map((e) => e.toLowerCase());
  const results: SearchResult[] = candidates.map((post) => {
    const postText = (
      post.title +
      " " +
      post.body +
      " " +
      post.tags.join(" ") +
      " " +
      post.mistakes.join(" ") +
      " " +
      post.lessons.join(" ")
    ).toLowerCase();

    let score = 0;
    const matchedTerms: string[] = [];

    // Term frequency scoring with expanded semantic terms
    for (const term of lowerExpanded) {
      if (postText.includes(term)) {
        score += 1;
        matchedTerms.push(term);
      }
    }

    // Title match bonus
    for (const token of tokens) {
      if (post.title.toLowerCase().includes(token)) score += 2;
    }

    // Helpful votes boost
    score += Math.log(post.helpful_count + 1) * 1.5;

    // Verified contributor boost
    if (post.verified) score += 1.5;

    // Recency boost (newer = slightly higher)
    const ageDays = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 2 - ageDays / 15);

    return { post, score, matchedTerms };
  });

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

function buildPrompt(query: string, posts: Post[], mode: LearningMode): string {
  const modeInstruction =
    mode === "beginner"
      ? "Use simple, beginner-friendly language. Explain any technical terms. Assume the reader has no prior experience."
      : mode === "intermediate"
      ? "Use clear language with some technical terms explained. Assume basic familiarity with the topic."
      : "Use advanced, expert-level language. You can assume the reader understands technical concepts and jargon.";

  const postsContext = posts
    .map(
      (p, i) =>
        `[Post ${i + 1}]\nTitle: ${p.title}\nAuthor: ${p.author_name} (${p.author_role}${p.verified ? ", Verified" : ""})\nCategory: ${p.category?.name || "Uncategorized"}\nMistakes: ${p.mistakes.join("; ")}\nLessons: ${p.lessons.join("; ")}\nExcerpt: ${p.body.slice(0, 600)}\nHelpful votes: ${p.helpful_count}\nDate: ${new Date(p.created_at).toLocaleDateString()}\nPost ID: ${p.id}`
    )
    .join("\n\n---\n\n");

  return `You are an AI Learning Assistant. Your job is to analyze real community experiences and synthesize them into a practical guide. You must ONLY use the community posts provided below. Do NOT use general internet knowledge. If the posts do not contain enough information on a topic, say so honestly.

${modeInstruction}

User question: "${query}"

Community posts analyzed (${posts.length}):
${postsContext}

Based ONLY on these community posts, generate a JSON response with this exact structure. Every section must be derived from the posts. If a section has no relevant content from the posts, use an empty array or a brief honest note.

{
  "overview": "A short 2-3 sentence explanation of the topic based on the posts",
  "commonMistakes": ["ranked list of most frequently reported mistakes"],
  "whyTheyHappen": ["common reasons people made these mistakes"],
  "howToAvoid": ["practical advice collected from the community"],
  "communityTips": ["useful advice quotes or tips from experienced users"],
  "wishIKnew": ["lessons users wish they knew earlier, as short quotes"],
  "beginnerChecklist": ["simple checklist items"],
  "costlyMistakes": ["mistakes that cause financial loss, damage, health or safety risks"],
  "safetyWarnings": ["important safety advice from community experiences"],
  "faq": [{"q": "question", "a": "answer based on posts"}],
  "relatedTopics": ["related topic suggestions"],
  "peopleAlsoSearched": ["related searches people might try"]
}

Return ONLY valid JSON. Do not include markdown code fences or any text outside the JSON.`;
}

export async function generateAIAnswer(
  query: string,
  posts: Post[]
): Promise<AIResponse> {
  const apiKey = getApiKey();
  const mode = getLearningMode();

  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  if (posts.length === 0) {
    return buildEmptyResponse(query, mode);
  }

  const prompt = buildPrompt(query, posts, mode);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI Learning Assistant that analyzes community experiences. You return only valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("INVALID_API_KEY");
    if (response.status === 429) throw new Error("RATE_LIMITED");
    throw new Error(`AI request failed (${response.status})`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) throw new Error("EMPTY_RESPONSE");

  // Strip any markdown fences if present
  const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(jsonStr);

  const dates = posts.map((p) => new Date(p.created_at).getTime());
  const newest = new Date(Math.max(...dates)).toLocaleDateString();
  const oldest = new Date(Math.min(...dates)).toLocaleDateString();

  const categoryNames = Array.from(
    new Set(posts.map((p) => p.category?.name).filter(Boolean))
  ) as string[];

  const confidence: "High" | "Medium" | "Low" =
    posts.length >= 5 ? "High" : posts.length >= 3 ? "Medium" : "Low";

  return {
    query,
    overview: parsed.overview || "",
    commonMistakes: parsed.commonMistakes || [],
    whyTheyHappen: parsed.whyTheyHappen || [],
    howToAvoid: parsed.howToAvoid || [],
    communityTips: parsed.communityTips || [],
    wishIKnew: parsed.wishIKnew || [],
    beginnerChecklist: parsed.beginnerChecklist || [],
    costlyMistakes: parsed.costlyMistakes || [],
    safetyWarnings: parsed.safetyWarnings || [],
    faq: parsed.faq || [],
    recommendedPosts: posts.slice(0, 10).map((p) => ({
      id: p.id,
      title: p.title,
      author_name: p.author_name,
    })),
    trust: {
      postsAnalyzed: posts.length,
      categories: categoryNames,
      confidence,
      newestPost: newest,
      oldestPost: oldest,
    },
    relatedTopics: parsed.relatedTopics || [],
    peopleAlsoSearched: parsed.peopleAlsoSearched || [],
    learningMode: mode,
  };
}

function buildEmptyResponse(query: string, mode: LearningMode): AIResponse {
  return {
    query,
    overview:
      "There are not enough community experiences on this topic yet to provide a reliable AI-generated guide. We do not invent experiences — every answer is grounded in real stories shared by users.",
    commonMistakes: [],
    whyTheyHappen: [],
    howToAvoid: [],
    communityTips: [],
    wishIKnew: [],
    beginnerChecklist: [],
    costlyMistakes: [],
    safetyWarnings: [],
    faq: [],
    recommendedPosts: [],
    trust: {
      postsAnalyzed: 0,
      categories: [],
      confidence: "Low",
      newestPost: "N/A",
      oldestPost: "N/A",
    },
    relatedTopics: [],
    peopleAlsoSearched: [],
    learningMode: mode,
  };
}
