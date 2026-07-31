import type { ResumeData } from '@/types/resume';

interface Props {
  data: ResumeData;
  template: string;
}

function formatDateRange(start: string, end: string, current?: boolean): string {
  const fmt = (d: string) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };
  const s = fmt(start);
  const e = current ? 'Present' : fmt(end);
  if (!s && !e) return '';
  return `${s} — ${e}`;
}

export default function ResumePreview({ data, template }: Props) {
  const { personal, experience, education, skills, projects } = data;
  const name = personal.fullName || 'Your Name';
  const title = personal.jobTitle || 'Your Job Title';

  const hasContact = Boolean(personal.email || personal.phone || personal.location || personal.website || personal.linkedin);
  const hasExperience = experience.length > 0;
  const hasEducation = education.length > 0;
  const hasSkills = skills.length > 0;
  const hasProjects = projects.length > 0;

  const shared = {
    name,
    title,
    personal,
    hasContact,
    experience,
    education,
    skills,
    projects,
    hasExperience,
    hasEducation,
    hasSkills,
    hasProjects,
    formatDateRange,
  };

  switch (template) {
    case 'classic': return <ClassicTemplate {...shared} />;
    case 'minimal': return <MinimalTemplate {...shared} />;
    case 'professional': return <ProfessionalTemplate {...shared} />;
    case 'creative': return <CreativeTemplate {...shared} />;
    case 'compact': return <CompactTemplate {...shared} />;
    case 'elegant': return <ElegantTemplate {...shared} />;
    case 'bold': return <BoldTemplate {...shared} />;
    case 'simple': return <SimpleTemplate {...shared} />;
    case 'executive': return <ExecutiveTemplate {...shared} />;
    default: return <ModernTemplate {...shared} />;
  }
}

interface TemplateProps {
  name: string;
  title: string;
  personal: ResumeData['personal'];
  hasContact: boolean;
  experience: ResumeData['experience'];
  education: ResumeData['education'];
  skills: string[];
  projects: ResumeData['projects'];
  hasExperience: boolean;
  hasEducation: boolean;
  hasSkills: boolean;
  hasProjects: boolean;
  formatDateRange: (s: string, e: string, c?: boolean) => string;
}

function ContactLine({ personal }: { personal: ResumeData['personal'] }) {
  const parts = [personal.email, personal.phone, personal.location, personal.website, personal.linkedin].filter(Boolean);
  return <span>{parts.join('  •  ')}</span>;
}

function SectionTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${className}`}>{children}</h3>;
}

function ModernTemplate(p: TemplateProps) {
  return (
    <div className="resume-page font-sans text-slate-800" style={{ fontSize: '13px', lineHeight: 1.5 }}>
      <div className="border-l-4 border-sky-600 pl-4 mb-5">
        <h1 className="text-2xl font-bold text-slate-900">{p.name}</h1>
        <p className="text-sky-700 font-medium">{p.title}</p>
      </div>
      {p.hasContact && <div className="text-xs text-slate-600 mb-5"><ContactLine personal={p.personal} /></div>}
      {p.personal.summary && (
        <section className="mb-5">
          <SectionTitle className="text-sky-700">Summary</SectionTitle>
          <p className="text-slate-700">{p.personal.summary}</p>
        </section>
      )}
      {p.hasExperience && (
        <section className="mb-5">
          <SectionTitle className="text-sky-700">Experience</SectionTitle>
          <div className="space-y-3">
            {p.experience.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-slate-900">{e.position} · {e.company}</span>
                  <span className="text-xs text-slate-500">{p.formatDateRange(e.startDate, e.endDate, e.current)}</span>
                </div>
                {e.description && <p className="text-slate-700 mt-1 whitespace-pre-line">{e.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasEducation && (
        <section className="mb-5">
          <SectionTitle className="text-sky-700">Education</SectionTitle>
          <div className="space-y-2">
            {p.education.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-slate-900">{e.degree}{e.field ? `, ${e.field}` : ''}</span>
                  <span className="text-xs text-slate-500">{p.formatDateRange(e.startDate, e.endDate)}</span>
                </div>
                <span className="text-slate-700">{e.institution}</span>
                {e.description && <p className="text-slate-600 text-sm mt-0.5">{e.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasSkills && (
        <section className="mb-5">
          <SectionTitle className="text-sky-700">Skills</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {p.skills.map((s, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 text-xs border border-sky-100">{s}</span>
            ))}
          </div>
        </section>
      )}
      {p.hasProjects && (
        <section>
          <SectionTitle className="text-sky-700">Projects</SectionTitle>
          <div className="space-y-2">
            {p.projects.map((pr) => (
              <div key={pr.id}>
                <span className="font-semibold text-slate-900">{pr.name}</span>
                {pr.link && <span className="text-xs text-sky-600 ml-2">{pr.link}</span>}
                {pr.description && <p className="text-slate-700 mt-0.5">{pr.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ClassicTemplate(p: TemplateProps) {
  return (
    <div className="resume-page font-serif text-slate-800" style={{ fontSize: '13px', lineHeight: 1.5 }}>
      <div className="text-center mb-5 pb-4 border-b-2 border-slate-300">
        <h1 className="text-2xl font-bold text-slate-900">{p.name}</h1>
        <p className="text-slate-700 italic">{p.title}</p>
        {p.hasContact && <div className="text-xs text-slate-600 mt-2"><ContactLine personal={p.personal} /></div>}
      </div>
      {p.personal.summary && (
        <section className="mb-5">
          <SectionTitle className="text-center border-b border-slate-300 pb-0.5">Summary</SectionTitle>
          <p className="text-slate-700 mt-2">{p.personal.summary}</p>
        </section>
      )}
      {p.hasExperience && (
        <section className="mb-5">
          <SectionTitle className="text-center border-b border-slate-300 pb-0.5">Experience</SectionTitle>
          <div className="space-y-3 mt-2">
            {p.experience.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900">{e.company}</span>
                  <span className="text-xs text-slate-500">{p.formatDateRange(e.startDate, e.endDate, e.current)}</span>
                </div>
                <span className="italic text-slate-700">{e.position}</span>
                {e.description && <p className="text-slate-700 mt-1 whitespace-pre-line">{e.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasEducation && (
        <section className="mb-5">
          <SectionTitle className="text-center border-b border-slate-300 pb-0.5">Education</SectionTitle>
          <div className="space-y-2 mt-2">
            {p.education.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900">{e.institution}</span>
                  <span className="text-xs text-slate-500">{p.formatDateRange(e.startDate, e.endDate)}</span>
                </div>
                <span className="italic text-slate-700">{e.degree}{e.field ? `, ${e.field}` : ''}</span>
                {e.description && <p className="text-slate-600 mt-0.5">{e.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasSkills && (
        <section className="mb-5">
          <SectionTitle className="text-center border-b border-slate-300 pb-0.5">Skills</SectionTitle>
          <p className="text-slate-700 mt-2">{p.skills.join(', ')}</p>
        </section>
      )}
      {p.hasProjects && (
        <section>
          <SectionTitle className="text-center border-b border-slate-300 pb-0.5">Projects</SectionTitle>
          <div className="space-y-2 mt-2">
            {p.projects.map((pr) => (
              <div key={pr.id}>
                <span className="font-bold text-slate-900">{pr.name}</span>
                {pr.description && <p className="text-slate-700 mt-0.5">{pr.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MinimalTemplate(p: TemplateProps) {
  return (
    <div className="resume-page font-sans text-slate-800" style={{ fontSize: '13px', lineHeight: 1.6 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-slate-900 tracking-tight">{p.name}</h1>
        <p className="text-slate-500 font-light">{p.title}</p>
        {p.hasContact && <div className="text-xs text-slate-500 mt-3"><ContactLine personal={p.personal} /></div>}
      </div>
      {p.personal.summary && (
        <section className="mb-6">
          <p className="text-slate-600 italic font-light">{p.personal.summary}</p>
        </section>
      )}
      {p.hasExperience && (
        <section className="mb-6">
          <SectionTitle>Experience</SectionTitle>
          <div className="space-y-4">
            {p.experience.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-900">{e.position}, {e.company}</span>
                  <span className="text-xs text-slate-400">{p.formatDateRange(e.startDate, e.endDate, e.current)}</span>
                </div>
                {e.description && <p className="text-slate-600 mt-1 whitespace-pre-line">{e.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasEducation && (
        <section className="mb-6">
          <SectionTitle>Education</SectionTitle>
          <div className="space-y-2">
            {p.education.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-900">{e.degree}{e.field ? `, ${e.field}` : ''}, {e.institution}</span>
                  <span className="text-xs text-slate-400">{p.formatDateRange(e.startDate, e.endDate)}</span>
                </div>
                {e.description && <p className="text-slate-500 text-sm">{e.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasSkills && (
        <section className="mb-6">
          <SectionTitle>Skills</SectionTitle>
          <p className="text-slate-600">{p.skills.join(' · ')}</p>
        </section>
      )}
      {p.hasProjects && (
        <section>
          <SectionTitle>Projects</SectionTitle>
          <div className="space-y-2">
            {p.projects.map((pr) => (
              <div key={pr.id}>
                <span className="text-slate-900">{pr.name}</span>
                {pr.description && <p className="text-slate-600 mt-0.5">{pr.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProfessionalTemplate(p: TemplateProps) {
  return (
    <div className="resume-page font-sans text-slate-800 grid grid-cols-3 gap-6" style={{ fontSize: '13px', lineHeight: 1.5 }}>
      <div className="col-span-1">
        <h1 className="text-xl font-bold text-slate-900 mb-1">{p.name}</h1>
        <p className="text-slate-600 text-sm mb-4">{p.title}</p>
        {p.hasContact && (
          <div className="mb-5 text-xs text-slate-600 space-y-0.5">
            {p.personal.email && <div>{p.personal.email}</div>}
            {p.personal.phone && <div>{p.personal.phone}</div>}
            {p.personal.location && <div>{p.personal.location}</div>}
            {p.personal.website && <div>{p.personal.website}</div>}
            {p.personal.linkedin && <div>{p.personal.linkedin}</div>}
          </div>
        )}
        {p.hasSkills && (
          <section className="mb-5">
            <SectionTitle className="text-slate-700">Skills</SectionTitle>
            <ul className="text-xs text-slate-600 space-y-0.5">
              {p.skills.map((s, i) => <li key={i}>• {s}</li>)}
            </ul>
          </section>
        )}
        {p.hasEducation && (
          <section>
            <SectionTitle className="text-slate-700">Education</SectionTitle>
            <div className="space-y-2">
              {p.education.map((e) => (
                <div key={e.id} className="text-xs">
                  <div className="font-semibold text-slate-900">{e.degree}{e.field ? `, ${e.field}` : ''}</div>
                  <div className="text-slate-600">{e.institution}</div>
                  <div className="text-slate-400">{p.formatDateRange(e.startDate, e.endDate)}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <div className="col-span-2">
        {p.personal.summary && (
          <section className="mb-5">
            <SectionTitle className="text-slate-700">Summary</SectionTitle>
            <p className="text-slate-700 text-sm">{p.personal.summary}</p>
          </section>
        )}
        {p.hasExperience && (
          <section className="mb-5">
            <SectionTitle className="text-slate-700">Experience</SectionTitle>
            <div className="space-y-3">
              {p.experience.map((e) => (
                <div key={e.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-slate-900 text-sm">{e.position} · {e.company}</span>
                    <span className="text-xs text-slate-500">{p.formatDateRange(e.startDate, e.endDate, e.current)}</span>
                  </div>
                  {e.description && <p className="text-slate-700 text-sm mt-1 whitespace-pre-line">{e.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
        {p.hasProjects && (
          <section>
            <SectionTitle className="text-slate-700">Projects</SectionTitle>
            <div className="space-y-2">
              {p.projects.map((pr) => (
                <div key={pr.id} className="text-sm">
                  <span className="font-semibold text-slate-900">{pr.name}</span>
                  {pr.description && <p className="text-slate-700 mt-0.5">{pr.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function CreativeTemplate(p: TemplateProps) {
  return (
    <div className="resume-page font-sans text-slate-800" style={{ fontSize: '13px', lineHeight: 1.5 }}>
      <div className="bg-gradient-to-r from-rose-500 to-orange-500 text-white -m-8 p-8 mb-5 rounded-none">
        <h1 className="text-3xl font-bold">{p.name}</h1>
        <p className="text-white/90 font-medium">{p.title}</p>
        {p.hasContact && <div className="text-xs text-white/80 mt-2"><ContactLine personal={p.personal} /></div>}
      </div>
      {p.personal.summary && (
        <section className="mb-5">
          <SectionTitle className="text-rose-600">About Me</SectionTitle>
          <p className="text-slate-700">{p.personal.summary}</p>
        </section>
      )}
      {p.hasExperience && (
        <section className="mb-5">
          <SectionTitle className="text-rose-600">Experience</SectionTitle>
          <div className="space-y-3">
            {p.experience.map((e) => (
              <div key={e.id} className="border-l-2 border-rose-200 pl-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-slate-900">{e.position} · {e.company}</span>
                  <span className="text-xs text-slate-500">{p.formatDateRange(e.startDate, e.endDate, e.current)}</span>
                </div>
                {e.description && <p className="text-slate-700 mt-1 whitespace-pre-line">{e.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasEducation && (
        <section className="mb-5">
          <SectionTitle className="text-rose-600">Education</SectionTitle>
          <div className="space-y-2">
            {p.education.map((e) => (
              <div key={e.id}>
                <span className="font-semibold text-slate-900">{e.degree}{e.field ? `, ${e.field}` : ''}</span>
                <span className="text-slate-600"> — {e.institution}</span>
                <span className="text-xs text-slate-500 block">{p.formatDateRange(e.startDate, e.endDate)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasSkills && (
        <section className="mb-5">
          <SectionTitle className="text-rose-600">Skills</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {p.skills.map((s, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs border border-rose-100">{s}</span>
            ))}
          </div>
        </section>
      )}
      {p.hasProjects && (
        <section>
          <SectionTitle className="text-rose-600">Projects</SectionTitle>
          <div className="space-y-2">
            {p.projects.map((pr) => (
              <div key={pr.id}>
                <span className="font-semibold text-slate-900">{pr.name}</span>
                {pr.description && <p className="text-slate-700 mt-0.5">{pr.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CompactTemplate(p: TemplateProps) {
  return (
    <div className="resume-page font-sans text-slate-800" style={{ fontSize: '12px', lineHeight: 1.4 }}>
      <div className="mb-3 pb-2 border-b border-slate-300">
        <h1 className="text-xl font-bold text-slate-900">{p.name}</h1>
        <p className="text-slate-700 text-sm">{p.title}</p>
        {p.hasContact && <div className="text-xs text-slate-500 mt-1"><ContactLine personal={p.personal} /></div>}
      </div>
      {p.personal.summary && (
        <section className="mb-3">
          <SectionTitle>Summary</SectionTitle>
          <p className="text-slate-700">{p.personal.summary}</p>
        </section>
      )}
      {p.hasExperience && (
        <section className="mb-3">
          <SectionTitle>Experience</SectionTitle>
          <div className="space-y-2">
            {p.experience.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-slate-900">{e.position}, {e.company}</span>
                  <span className="text-xs text-slate-500">{p.formatDateRange(e.startDate, e.endDate, e.current)}</span>
                </div>
                {e.description && <p className="text-slate-700 mt-0.5 whitespace-pre-line">{e.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasEducation && (
        <section className="mb-3">
          <SectionTitle>Education</SectionTitle>
          <div className="space-y-1">
            {p.education.map((e) => (
              <div key={e.id} className="flex justify-between items-baseline">
                <span><span className="font-semibold text-slate-900">{e.degree}{e.field ? `, ${e.field}` : ''}</span>, {e.institution}</span>
                <span className="text-xs text-slate-500">{p.formatDateRange(e.startDate, e.endDate)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasSkills && (
        <section className="mb-3">
          <SectionTitle>Skills</SectionTitle>
          <p className="text-slate-700">{p.skills.join(', ')}</p>
        </section>
      )}
      {p.hasProjects && (
        <section>
          <SectionTitle>Projects</SectionTitle>
          <div className="space-y-1">
            {p.projects.map((pr) => (
              <div key={pr.id}>
                <span className="font-semibold text-slate-900">{pr.name}</span>
                {pr.description && <span className="text-slate-700"> — {pr.description}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ElegantTemplate(p: TemplateProps) {
  return (
    <div className="resume-page font-serif text-slate-800" style={{ fontSize: '13px', lineHeight: 1.6 }}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-wide text-slate-900">{p.name.toUpperCase()}</h1>
        <div className="flex items-center justify-center gap-2 my-2">
          <div className="h-px bg-slate-300 w-12" />
          <p className="text-slate-600 text-sm tracking-widest uppercase">{p.title}</p>
          <div className="h-px bg-slate-300 w-12" />
        </div>
        {p.hasContact && <div className="text-xs text-slate-500"><ContactLine personal={p.personal} /></div>}
      </div>
      {p.personal.summary && (
        <section className="mb-5 text-center">
          <p className="text-slate-700 italic max-w-md mx-auto">{p.personal.summary}</p>
        </section>
      )}
      {p.hasExperience && (
        <section className="mb-5">
          <SectionTitle className="text-center">Experience</SectionTitle>
          <div className="space-y-3">
            {p.experience.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900">{e.position}, {e.company}</span>
                  <span className="text-xs text-slate-500 italic">{p.formatDateRange(e.startDate, e.endDate, e.current)}</span>
                </div>
                {e.description && <p className="text-slate-700 mt-1 whitespace-pre-line">{e.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasEducation && (
        <section className="mb-5">
          <SectionTitle className="text-center">Education</SectionTitle>
          <div className="space-y-2">
            {p.education.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900">{e.institution}</span>
                  <span className="text-xs text-slate-500 italic">{p.formatDateRange(e.startDate, e.endDate)}</span>
                </div>
                <span className="text-slate-700">{e.degree}{e.field ? `, ${e.field}` : ''}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasSkills && (
        <section className="mb-5">
          <SectionTitle className="text-center">Skills</SectionTitle>
          <p className="text-slate-700 text-center">{p.skills.join(' · ')}</p>
        </section>
      )}
      {p.hasProjects && (
        <section>
          <SectionTitle className="text-center">Projects</SectionTitle>
          <div className="space-y-2">
            {p.projects.map((pr) => (
              <div key={pr.id} className="text-center">
                <span className="font-bold text-slate-900">{pr.name}</span>
                {pr.description && <p className="text-slate-700 mt-0.5">{pr.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BoldTemplate(p: TemplateProps) {
  return (
    <div className="resume-page font-sans text-slate-800" style={{ fontSize: '13px', lineHeight: 1.5 }}>
      <div className="bg-slate-900 text-white -m-8 p-8 mb-5">
        <h1 className="text-3xl font-black tracking-tight">{p.name}</h1>
        <p className="text-slate-300 font-medium text-lg">{p.title}</p>
        {p.hasContact && <div className="text-xs text-slate-400 mt-3"><ContactLine personal={p.personal} /></div>}
      </div>
      {p.personal.summary && (
        <section className="mb-5">
          <SectionTitle className="text-slate-900 text-sm">Summary</SectionTitle>
          <p className="text-slate-700">{p.personal.summary}</p>
        </section>
      )}
      {p.hasExperience && (
        <section className="mb-5">
          <SectionTitle className="text-slate-900 text-sm">Experience</SectionTitle>
          <div className="space-y-3">
            {p.experience.map((e) => (
              <div key={e.id} className="border-l-4 border-slate-900 pl-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900">{e.position}</span>
                  <span className="text-xs text-slate-500">{p.formatDateRange(e.startDate, e.endDate, e.current)}</span>
                </div>
                <span className="font-medium text-slate-700">{e.company}</span>
                {e.description && <p className="text-slate-700 mt-1 whitespace-pre-line">{e.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasEducation && (
        <section className="mb-5">
          <SectionTitle className="text-slate-900 text-sm">Education</SectionTitle>
          <div className="space-y-2">
            {p.education.map((e) => (
              <div key={e.id}>
                <span className="font-bold text-slate-900">{e.degree}{e.field ? `, ${e.field}` : ''}</span>
                <span className="text-slate-700"> — {e.institution}</span>
                <span className="text-xs text-slate-500 block">{p.formatDateRange(e.startDate, e.endDate)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasSkills && (
        <section className="mb-5">
          <SectionTitle className="text-slate-900 text-sm">Skills</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {p.skills.map((s, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-white text-xs font-medium">{s}</span>
            ))}
          </div>
        </section>
      )}
      {p.hasProjects && (
        <section>
          <SectionTitle className="text-slate-900 text-sm">Projects</SectionTitle>
          <div className="space-y-2">
            {p.projects.map((pr) => (
              <div key={pr.id}>
                <span className="font-bold text-slate-900">{pr.name}</span>
                {pr.description && <p className="text-slate-700 mt-0.5">{pr.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SimpleTemplate(p: TemplateProps) {
  return (
    <div className="resume-page font-sans text-slate-800" style={{ fontSize: '13px', lineHeight: 1.5 }}>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">{p.name}</h1>
        <p className="text-slate-700">{p.title}</p>
        {p.hasContact && <div className="text-xs text-slate-500 mt-1"><ContactLine personal={p.personal} /></div>}
      </div>
      {p.personal.summary && (
        <section className="mb-5">
          <h3 className="font-bold text-slate-900 mb-1">Summary</h3>
          <p className="text-slate-700">{p.personal.summary}</p>
        </section>
      )}
      {p.hasExperience && (
        <section className="mb-5">
          <h3 className="font-bold text-slate-900 mb-2">Experience</h3>
          <div className="space-y-3">
            {p.experience.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-slate-900">{e.position}, {e.company}</span>
                  <span className="text-xs text-slate-500">{p.formatDateRange(e.startDate, e.endDate, e.current)}</span>
                </div>
                {e.description && <p className="text-slate-700 mt-1 whitespace-pre-line">{e.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasEducation && (
        <section className="mb-5">
          <h3 className="font-bold text-slate-900 mb-2">Education</h3>
          <div className="space-y-2">
            {p.education.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-slate-900">{e.degree}{e.field ? `, ${e.field}` : ''}, {e.institution}</span>
                  <span className="text-xs text-slate-500">{p.formatDateRange(e.startDate, e.endDate)}</span>
                </div>
                {e.description && <p className="text-slate-600 text-sm">{e.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasSkills && (
        <section className="mb-5">
          <h3 className="font-bold text-slate-900 mb-1">Skills</h3>
          <p className="text-slate-700">{p.skills.join(', ')}</p>
        </section>
      )}
      {p.hasProjects && (
        <section>
          <h3 className="font-bold text-slate-900 mb-2">Projects</h3>
          <div className="space-y-2">
            {p.projects.map((pr) => (
              <div key={pr.id}>
                <span className="font-semibold text-slate-900">{pr.name}</span>
                {pr.description && <p className="text-slate-700 mt-0.5">{pr.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ExecutiveTemplate(p: TemplateProps) {
  return (
    <div className="resume-page font-serif text-slate-800" style={{ fontSize: '13px', lineHeight: 1.5 }}>
      <div className="text-center mb-5 pb-4 border-b border-slate-400">
        <h1 className="text-2xl font-bold tracking-wider text-slate-900">{p.name}</h1>
        <p className="text-slate-600 tracking-wide uppercase text-sm mt-1">{p.title}</p>
        {p.hasContact && <div className="text-xs text-slate-500 mt-2"><ContactLine personal={p.personal} /></div>}
      </div>
      {p.personal.summary && (
        <section className="mb-5">
          <SectionTitle>Executive Summary</SectionTitle>
          <p className="text-slate-700">{p.personal.summary}</p>
        </section>
      )}
      {p.hasExperience && (
        <section className="mb-5">
          <SectionTitle>Professional Experience</SectionTitle>
          <div className="space-y-3">
            {p.experience.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900">{e.position}</span>
                  <span className="text-xs text-slate-500 italic">{p.formatDateRange(e.startDate, e.endDate, e.current)}</span>
                </div>
                <span className="font-semibold text-slate-700">{e.company}</span>
                {e.description && <p className="text-slate-700 mt-1 whitespace-pre-line">{e.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasEducation && (
        <section className="mb-5">
          <SectionTitle>Education</SectionTitle>
          <div className="space-y-2">
            {p.education.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900">{e.degree}{e.field ? `, ${e.field}` : ''}</span>
                  <span className="text-xs text-slate-500 italic">{p.formatDateRange(e.startDate, e.endDate)}</span>
                </div>
                <span className="text-slate-700">{e.institution}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      {p.hasSkills && (
        <section className="mb-5">
          <SectionTitle>Core Competencies</SectionTitle>
          <p className="text-slate-700">{p.skills.join(' | ')}</p>
        </section>
      )}
      {p.hasProjects && (
        <section>
          <SectionTitle>Key Projects</SectionTitle>
          <div className="space-y-2">
            {p.projects.map((pr) => (
              <div key={pr.id}>
                <span className="font-bold text-slate-900">{pr.name}</span>
                {pr.description && <p className="text-slate-700 mt-0.5">{pr.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
