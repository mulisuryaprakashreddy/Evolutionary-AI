import type { ResumeData } from '@/types/resume';

export interface ATSScoreResult {
  score: number;
  checks: { label: string; passed: boolean; message: string }[];
}

export function calculateATSScore(data: ResumeData): ATSScoreResult {
  const checks: ATSScoreResult['checks'] = [];
  const { personal, experience, education, skills } = data;

  // Contact info
  checks.push({
    label: 'Email address',
    passed: !!personal.email,
    message: personal.email ? 'Email is present.' : 'Add an email address so recruiters can reach you.',
  });
  checks.push({
    label: 'Phone number',
    passed: !!personal.phone,
    message: personal.phone ? 'Phone number is present.' : 'Add a phone number for recruiter contact.',
  });
  checks.push({
    label: 'Location',
    passed: !!personal.location,
    message: personal.location ? 'Location is present.' : 'Add your location — many ATS systems filter by it.',
  });

  // Summary
  const summaryWords = personal.summary.trim().split(/\s+/).filter(Boolean).length;
  checks.push({
    label: 'Professional summary',
    passed: summaryWords >= 30,
    message:
      summaryWords >= 30
        ? 'Summary has good length.'
        : `Summary is ${summaryWords} words — aim for at least 30 to describe your value.`,
  });

  // Experience
  checks.push({
    label: 'Work experience',
    passed: experience.length >= 1,
    message:
      experience.length >= 1
        ? `${experience.length} experience entr${experience.length === 1 ? 'y' : 'ies'} listed.`
        : 'Add at least one work experience entry.',
  });

  const hasActionVerbs = experience.some((e) =>
    /\b(led|built|managed|created|developed|launched|improved|increased|reduced|designed|implemented|drove|achieved|delivered|optimized|architected|spearheaded|negotiated|analyzed|streamlined)\b/i.test(
      e.description,
    ),
  );
  checks.push({
    label: 'Action-oriented bullet points',
    passed: hasActionVerbs,
    message: hasActionVerbs
      ? 'Experience uses strong action verbs.'
      : 'Start bullet points with action verbs (Led, Built, Improved, etc.).',
  });

  const hasMetrics = experience.some((e) => /\d+%|\$\d|\d+x|\d+ users|\d+ projects|\d+ hours/i.test(e.description));
  checks.push({
    label: 'Quantified achievements',
    passed: hasMetrics,
    message: hasMetrics
      ? 'Achievements include numbers or metrics.'
      : 'Add metrics to your experience (e.g. "Increased sales by 20%").',
  });

  // Education
  checks.push({
    label: 'Education',
    passed: education.length >= 1,
    message:
      education.length >= 1
        ? 'Education section is filled in.'
        : 'Add at least one education entry.',
  });

  // Skills
  checks.push({
    label: 'Skills section',
    passed: skills.length >= 5,
    message:
      skills.length >= 5
        ? `${skills.length} skills listed.`
        : `Only ${skills.length} skill${skills.length === 1 ? '' : 's'} — add at least 5 relevant skills.`,
  });

  // Section completeness
  checks.push({
    label: 'Job title',
    passed: !!personal.jobTitle,
    message: personal.jobTitle ? 'Target job title is set.' : 'Add a target job title to help ATS categorize your resume.',
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return { score, checks };
}

export interface Suggestion {
  section: string;
  original: string;
  improved: string;
  reason: string;
}

export function generateSuggestions(data: ResumeData): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Summary suggestions
  if (data.personal.summary && data.personal.summary.split(/\s+/).length < 40) {
    suggestions.push({
      section: 'Summary',
      original: data.personal.summary,
      improved: `${data.personal.summary} ${data.personal.jobTitle ? `As a ${data.personal.jobTitle},` : 'I'} have a proven track record of delivering high-quality results, collaborating across teams, and continuously learning to stay ahead in the field. I am passionate about creating impact and driving measurable outcomes.`,
      reason: 'Your summary is short. A stronger summary highlights your track record and value proposition.',
    });
  }

  // Experience bullet point suggestions
  data.experience.forEach((exp) => {
    if (!exp.description) return;
    const lines = exp.description.split('\n').filter((l) => l.trim());
    lines.forEach((line) => {
      if (/responsible for|duties include|worked on|helped with/i.test(line)) {
        suggestions.push({
          section: `Experience — ${exp.position} at ${exp.company}`,
          original: line,
          improved: line
            .replace(/responsible for/i, 'Led')
            .replace(/duties include/i, 'Managed')
            .replace(/worked on/i, 'Developed')
            .replace(/helped with/i, 'Drove'),
          reason: 'Replace passive phrases with strong action verbs for more impact.',
        });
      }
      if (!/\d/.test(line) && line.length > 20) {
        suggestions.push({
          section: `Experience — ${exp.position} at ${exp.company}`,
          original: line,
          improved: `${line.replace(/\.$/, '')}, resulting in a 20% improvement in efficiency and saving 10+ hours per week.`,
          reason: 'Add quantifiable results to make your impact concrete and measurable.',
        });
      }
    });
  });

  // Skills suggestions
  if (data.skills.length > 0 && data.skills.length < 8) {
    const commonSkills = [
      'Communication',
      'Team Leadership',
      'Project Management',
      'Problem Solving',
      'Collaboration',
      'Time Management',
    ];
    const missing = commonSkills.filter((s) => !data.skills.includes(s)).slice(0, 3);
    if (missing.length > 0) {
      suggestions.push({
        section: 'Skills',
        original: data.skills.join(', '),
        improved: [...data.skills, ...missing].join(', '),
        reason: `Consider adding: ${missing.join(', ')}. These are commonly sought by recruiters.`,
      });
    }
  }

  return suggestions;
}
