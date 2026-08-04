import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft, Plus, Trash2, Download, Eye, EyeOff, Save, Loader2,
  User, Briefcase, GraduationCap, Wrench, FolderGit2, FileText,
  Sparkles, Shield, CheckCircle2, XCircle, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { navigate } from '@/lib/router';
import {
  emptyResumeData, templates, createId,
  type ResumeData, type Resume, type ExperienceItem, type EducationItem, type ProjectItem,
} from '@/types/resume';
import ResumePreview from '@/components/ResumePreview';
import { calculateATSScore, generateSuggestions, type ATSScoreResult, type Suggestion } from '@/lib/ats';

type Tab = 'personal' | 'experience' | 'education' | 'skills' | 'projects';

export default function Editor({ resumeId }: { resumeId: string }) {
  const { user } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [data, setData] = useState<ResumeData>(emptyResumeData);
  const [template, setTemplate] = useState('modern');
  const [title, setTitle] = useState('Untitled Resume');
  const [tab, setTab] = useState<Tab>('personal');
  const [showPreview, setShowPreview] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [atsOpen, setAtsOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [atsResult, setAtsResult] = useState<ATSScoreResult | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // Load
  useEffect(() => {
    (async () => {
      const { data: row, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .maybeSingle();
      if (error || !row) {
        navigate('/dashboard');
        return;
      }
      const r = row as Resume;
      setResume(r);
      setData({ ...emptyResumeData, ...r.data });
      setTemplate(r.template);
      setTitle(r.title);
      setLoading(false);
    })();
  }, [resumeId]);

  // Debounced auto-save
  const save = useCallback(async (newData: ResumeData, newTemplate: string, newTitle: string) => {
    if (!resume) return;
    setSaving(true);
    const { error } = await supabase
      .from('resumes')
      .update({ data: newData, template: newTemplate, title: newTitle, updated_at: new Date().toISOString() })
      .eq('id', resumeId);
    setSaving(false);
    if (!error) setSavedAt(new Date());
  }, [resume, resumeId]);

  useEffect(() => {
    if (loading || !resume) return;
    const t = setTimeout(() => save(data, template, title), 1000);
    return () => clearTimeout(t);
  }, [data, template, title, loading, resume, save]);

  const updateData = (partial: Partial<ResumeData>) => {
    setData((d) => ({ ...d, ...partial }));
  };

  const handlePrint = () => {
    window.print();
  };

  const runATS = () => {
    setAtsResult(calculateATSScore(data));
    setAtsOpen(true);
  };

  const runSuggestions = () => {
    setSuggestions(generateSuggestions(data));
    setSuggestionsOpen(true);
  };

  const applySuggestion = (s: Suggestion) => {
    if (s.section === 'Summary') {
      updateData({ personal: { ...data.personal, summary: s.improved } });
    } else if (s.section === 'Skills') {
      updateData({ skills: s.improved.split(', ').map((x) => x.trim()) });
    } else if (s.section.startsWith('Experience')) {
      updateData({
        experience: data.experience.map((e) => ({
          ...e,
          description: e.description.replace(s.original, s.improved),
        })),
      });
    }
    setAiSuggestions((prev) => prev.filter((x) => x !== s));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 print:hidden">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <div className="w-px h-6 bg-slate-800 hidden sm:block" />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none focus:bg-slate-900 rounded px-2 py-1 min-w-0 flex-1 max-w-xs"
              placeholder="Resume title"
            />
            <div className="text-xs text-slate-500 hidden md:block">
              {saving ? (
                <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>
              ) : savedAt ? (
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-400" /> Saved</span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runSuggestions}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Suggestions</span>
            </button>
            <button
              onClick={runATS}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">ATS</span>
            </button>
            <button
              onClick={() => setShowPreview((s) => !s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Preview'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Editor panel */}
        <div className={`flex-1 overflow-y-auto ${showPreview ? 'lg:w-1/2' : 'lg:w-full'} print:hidden`}>
          <div className="max-w-2xl mx-auto p-6">
            {/* Tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    tab === id
                      ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {tab === 'personal' && <PersonalForm data={data} updateData={updateData} />}
            {tab === 'experience' && <ExperienceForm data={data} updateData={updateData} />}
            {tab === 'education' && <EducationForm data={data} updateData={updateData} />}
            {tab === 'skills' && <SkillsForm data={data} updateData={updateData} />}
            {tab === 'projects' && <ProjectsForm data={data} updateData={updateData} />}

            {/* Template picker */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-400" />
                Template
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`p-3 rounded-lg text-left border transition-colors ${
                      template === t.id
                        ? 'border-sky-500 bg-sky-500/10'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                    }`}
                  >
                    <span className="text-sm font-medium block">{t.name}</span>
                    <span className="text-xs text-slate-500">{t.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="lg:w-1/2 bg-slate-200/5 border-l border-slate-800/50 print:bg-white print:border-0 print:w-full">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-6 print:static print:h-auto print:p-0 print:overflow-visible">
              <div className="resume-sheet bg-white text-slate-900 shadow-2xl rounded-lg mx-auto" style={{ width: '100%', maxWidth: '800px', padding: '2rem 2.5rem', minHeight: '11in' }}>
                <ResumePreview data={data} template={template} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ATS Modal */}
      {atsOpen && atsResult && (
        <Modal onClose={() => setAtsOpen(false)} title="ATS Score Check">
          <div className="text-center mb-6">
            <div className={`text-5xl font-bold mb-1 ${
              atsResult.score >= 80 ? 'text-green-400' : atsResult.score >= 50 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {atsResult.score}
            </div>
            <p className="text-sm text-slate-400">out of 100</p>
          </div>
          <div className="space-y-2.5">
            {atsResult.checks.map((c) => (
              <div key={c.label} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/50">
                {c.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium">{c.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Suggestions Modal */}
      {suggestionsOpen && (
        <Modal onClose={() => setSuggestionsOpen(false)} title="Smart Suggestions">
              {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-sm text-slate-300">Your resume looks great! No suggestions at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <div key={i} className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                  <p className="text-xs font-semibold text-sky-400 mb-2">{s.section}</p>
                  <div className="mb-2">
                    <p className="text-xs text-slate-500 mb-0.5">Current:</p>
                    <p className="text-sm text-slate-400 line-through">{s.original}</p>
                  </div>
                  <div className="mb-2">
                    <p className="text-xs text-slate-500 mb-0.5">Improved:</p>
                    <p className="text-sm text-slate-200">{s.improved}</p>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{s.reason}</p>
                  <button
                    onClick={() => applySuggestion(s)}
                    className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-sm font-medium transition-colors"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden" onClick={onClose}>
      <div
        className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-950">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// --- Form Sections ---

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors text-sm text-slate-100 placeholder:text-slate-600';

function PersonalForm({ data, updateData }: { data: ResumeData; updateData: (p: Partial<ResumeData>) => void }) {
  const p = data.personal;
  const set = (partial: Partial<typeof p>) => updateData({ personal: { ...p, ...partial } });

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full Name"><input className={inputClass} value={p.fullName} onChange={(e) => set({ fullName: e.target.value })} placeholder="Jane Doe" /></Field>
        <Field label="Job Title"><input className={inputClass} value={p.jobTitle} onChange={(e) => set({ jobTitle: e.target.value })} placeholder="Software Engineer" /></Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Email"><input className={inputClass} type="email" value={p.email} onChange={(e) => set({ email: e.target.value })} placeholder="jane@example.com" /></Field>
        <Field label="Phone"><input className={inputClass} value={p.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+1 555 0100" /></Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Location"><input className={inputClass} value={p.location} onChange={(e) => set({ location: e.target.value })} placeholder="San Francisco, CA" /></Field>
        <Field label="Website"><input className={inputClass} value={p.website} onChange={(e) => set({ website: e.target.value })} placeholder="janedoe.com" /></Field>
      </div>
      <Field label="LinkedIn"><input className={inputClass} value={p.linkedin} onChange={(e) => set({ linkedin: e.target.value })} placeholder="linkedin.com/in/janedoe" /></Field>
      <Field label="Professional Summary">
        <textarea
          className={inputClass + ' min-h-[100px] resize-y'}
          value={p.summary}
          onChange={(e) => set({ summary: e.target.value })}
          placeholder="A brief summary of your experience, strengths, and career goals..."
        />
      </Field>
    </div>
  );
}

function ExperienceForm({ data, updateData }: { data: ResumeData; updateData: (p: Partial<ResumeData>) => void }) {
  const add = () => {
    const item: ExperienceItem = { id: createId(), company: '', position: '', startDate: '', endDate: '', current: false, description: '' };
    updateData({ experience: [...data.experience, item] });
  };
  const remove = (id: string) => updateData({ experience: data.experience.filter((e) => e.id !== id) });
  const update = (id: string, partial: Partial<ExperienceItem>) =>
    updateData({ experience: data.experience.map((e) => (e.id === id ? { ...e, ...partial } : e)) });

  return (
    <div className="space-y-4">
      {data.experience.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-8 border border-dashed border-slate-800 rounded-lg">
          No experience added yet.
        </p>
      )}
      {data.experience.map((e) => (
        <div key={e.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Experience Entry</span>
            <button onClick={() => remove(e.id)} className="text-slate-500 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Position"><input className={inputClass} value={e.position} onChange={(ev) => update(e.id, { position: ev.target.value })} placeholder="Software Engineer" /></Field>
            <Field label="Company"><input className={inputClass} value={e.company} onChange={(ev) => update(e.id, { company: ev.target.value })} placeholder="Acme Corp" /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Start Date"><input className={inputClass} type="month" value={e.startDate} onChange={(ev) => update(e.id, { startDate: ev.target.value })} /></Field>
            <Field label="End Date"><input className={inputClass} type="month" value={e.endDate} disabled={e.current} onChange={(ev) => update(e.id, { endDate: ev.target.value })} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input type="checkbox" checked={e.current} onChange={(ev) => update(e.id, { current: ev.target.checked })} className="accent-sky-500" />
            I currently work here
          </label>
          <Field label="Description (one bullet point per line)">
            <textarea
              className={inputClass + ' min-h-[100px] resize-y'}
              value={e.description}
              onChange={(ev) => update(e.id, { description: ev.target.value })}
              placeholder={'Led development of...\nImproved performance by...\nCollaborated with...'}
            />
          </Field>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full py-2.5 rounded-lg border border-dashed border-slate-700 hover:border-sky-500/50 hover:bg-sky-500/5 text-slate-400 hover:text-sky-300 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        Add Experience
      </button>
    </div>
  );
}

function EducationForm({ data, updateData }: { data: ResumeData; updateData: (p: Partial<ResumeData>) => void }) {
  const add = () => {
    const item: EducationItem = { id: createId(), institution: '', degree: '', field: '', startDate: '', endDate: '', description: '' };
    updateData({ education: [...data.education, item] });
  };
  const remove = (id: string) => updateData({ education: data.education.filter((e) => e.id !== id) });
  const update = (id: string, partial: Partial<EducationItem>) =>
    updateData({ education: data.education.map((e) => (e.id === id ? { ...e, ...partial } : e)) });

  return (
    <div className="space-y-4">
      {data.education.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-8 border border-dashed border-slate-800 rounded-lg">
          No education added yet.
        </p>
      )}
      {data.education.map((e) => (
        <div key={e.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Education Entry</span>
            <button onClick={() => remove(e.id)} className="text-slate-500 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Institution"><input className={inputClass} value={e.institution} onChange={(ev) => update(e.id, { institution: ev.target.value })} placeholder="Stanford University" /></Field>
            <Field label="Degree"><input className={inputClass} value={e.degree} onChange={(ev) => update(e.id, { degree: ev.target.value })} placeholder="B.S." /></Field>
          </div>
          <Field label="Field of Study"><input className={inputClass} value={e.field} onChange={(ev) => update(e.id, { field: ev.target.value })} placeholder="Computer Science" /></Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Start Date"><input className={inputClass} type="month" value={e.startDate} onChange={(ev) => update(e.id, { startDate: ev.target.value })} /></Field>
            <Field label="End Date"><input className={inputClass} type="month" value={e.endDate} onChange={(ev) => update(e.id, { endDate: ev.target.value })} /></Field>
          </div>
          <Field label="Description (optional)"><input className={inputClass} value={e.description} onChange={(ev) => update(e.id, { description: ev.target.value })} placeholder="GPA: 3.8, Dean's List" /></Field>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full py-2.5 rounded-lg border border-dashed border-slate-700 hover:border-sky-500/50 hover:bg-sky-500/5 text-slate-400 hover:text-sky-300 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        Add Education
      </button>
    </div>
  );
}

function SkillsForm({ data, updateData }: { data: ResumeData; updateData: (p: Partial<ResumeData>) => void }) {
  const [input, setInput] = useState('');
  const add = () => {
    const val = input.trim();
    if (!val) return;
    if (data.skills.includes(val)) { setInput(''); return; }
    updateData({ skills: [...data.skills, val] });
    setInput('');
  };
  const remove = (s: string) => updateData({ skills: data.skills.filter((x) => x !== s) });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          className={inputClass}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Type a skill and press Enter"
        />
        <button onClick={add} className="px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors shrink-0">
          Add
        </button>
      </div>
      {data.skills.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8 border border-dashed border-slate-800 rounded-lg">
          No skills added yet.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {data.skills.map((s) => (
            <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-sm">
              {s}
              <button onClick={() => remove(s)} className="text-sky-400/60 hover:text-red-400 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsForm({ data, updateData }: { data: ResumeData; updateData: (p: Partial<ResumeData>) => void }) {
  const add = () => {
    const item: ProjectItem = { id: createId(), name: '', description: '', link: '' };
    updateData({ projects: [...data.projects, item] });
  };
  const remove = (id: string) => updateData({ projects: data.projects.filter((p) => p.id !== id) });
  const update = (id: string, partial: Partial<ProjectItem>) =>
    updateData({ projects: data.projects.map((p) => (p.id === id ? { ...p, ...partial } : p)) });

  return (
    <div className="space-y-4">
      {data.projects.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-8 border border-dashed border-slate-800 rounded-lg">
          No projects added yet.
        </p>
      )}
      {data.projects.map((p) => (
        <div key={p.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Project Entry</span>
            <button onClick={() => remove(p.id)} className="text-slate-500 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <Field label="Project Name"><input className={inputClass} value={p.name} onChange={(e) => update(p.id, { name: e.target.value })} placeholder="Portfolio Website" /></Field>
          <Field label="Link (optional)"><input className={inputClass} value={p.link} onChange={(e) => update(p.id, { link: e.target.value })} placeholder="github.com/jane/project" /></Field>
          <Field label="Description"><textarea className={inputClass + ' min-h-[80px] resize-y'} value={p.description} onChange={(e) => update(p.id, { description: e.target.value })} placeholder="Built a responsive portfolio site using React and Tailwind..." /></Field>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full py-2.5 rounded-lg border border-dashed border-slate-700 hover:border-sky-500/50 hover:bg-sky-500/5 text-slate-400 hover:text-sky-300 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        Add Project
      </button>
    </div>
  );
}
