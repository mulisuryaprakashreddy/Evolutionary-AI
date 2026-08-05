export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  sort_order: number;
};

export type Post = {
  id: string;
  category_id: string | null;
  title: string;
  body: string;
  mistakes: string[];
  lessons: string[];
  tags: string[];
  author_name: string;
  author_role: string;
  verified: boolean;
  helpful_count: number;
  created_at: string;
  category?: Category | null;
};

export type Comment = {
  id: string;
  post_id: string;
  author_name: string;
  body: string;
  helpful_count: number;
  created_at: string;
};

export type LearningMode = "beginner" | "intermediate" | "expert";

export type AIResponseSection = {
  heading: string;
  items?: string[];
  text?: string;
  checklist?: string[];
};

export type AIResponse = {
  query: string;
  overview: string;
  commonMistakes: string[];
  whyTheyHappen: string[];
  howToAvoid: string[];
  communityTips: string[];
  wishIKnew: string[];
  beginnerChecklist: string[];
  costlyMistakes: string[];
  safetyWarnings: string[];
  faq: { q: string; a: string }[];
  recommendedPosts: { id: string; title: string; author_name: string }[];
  trust: {
    postsAnalyzed: number;
    categories: string[];
    confidence: "High" | "Medium" | "Low";
    newestPost: string;
    oldestPost: string;
  };
  relatedTopics: string[];
  peopleAlsoSearched: string[];
  learningMode: LearningMode;
};
