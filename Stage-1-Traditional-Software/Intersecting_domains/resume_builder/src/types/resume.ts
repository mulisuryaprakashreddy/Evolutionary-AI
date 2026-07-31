export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  summary: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  link: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  template: string;
  data: ResumeData;
  created_at: string;
  updated_at: string;
}

export const emptyResumeData: ResumeData = {
  personal: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
};

export const templates = [
  { id: 'modern', name: 'Modern', description: 'Clean sidebar accent with blue highlights' },
  { id: 'classic', name: 'Classic', description: 'Traditional centered header, timeless format' },
  { id: 'minimal', name: 'Minimal', description: 'Lots of whitespace, understated typography' },
  { id: 'professional', name: 'Professional', description: 'Two-column layout for experienced hires' },
  { id: 'creative', name: 'Creative', description: 'Bold colored header for design roles' },
  { id: 'compact', name: 'Compact', description: 'Dense layout that fits more on one page' },
  { id: 'elegant', name: 'Elegant', description: 'Serif fonts for a refined, academic feel' },
  { id: 'bold', name: 'Bold', description: 'Strong typographic hierarchy and contrast' },
  { id: 'simple', name: 'Simple', description: 'Basic, no-frills, easy to read' },
  { id: 'executive', name: 'Executive', description: 'Formal layout for senior leadership' },
] as const;

export type TemplateId = (typeof templates)[number]['id'];

export function createId(): string {
  return Math.random().toString(36).substring(2, 11);
}
