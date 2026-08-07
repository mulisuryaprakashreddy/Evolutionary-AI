import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card, Button, Input, Textarea, Select, Badge } from '@/components/ui';
import { toastSuccess, toastError } from '@/components/Toaster';
import type { Category, Skill, Project } from '@/lib/types';

export function PostProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isEdit = !!id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [deadline, setDeadline] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [projectType, setProjectType] = useState('fixed');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState('');

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories((data as Category[]) ?? []));
    supabase.from('skills').select('*').order('name').then(({ data }) => setAllSkills((data as Skill[]) ?? []));
    if (isEdit && id) {
      supabase
        .from('projects')
        .select('*, skills:skills(*)')
        .eq('id', id)
        .maybeSingle()
        .then(({ data }) => {
          const p = data as Project & { skills?: Skill[] };
          if (p) {
            setTitle(p.title);
            setDescription(p.description);
            setCategoryId(p.category_id ?? '');
            setBudgetMin(String(p.budget_min));
            setBudgetMax(String(p.budget_max));
            setDeadline(p.deadline ?? '');
            setExperienceLevel(p.experience_level ?? 'Intermediate');
            setProjectType(p.project_type);
            setSelectedSkills((p.skills ?? []).map((s) => s.id));
          }
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const filteredSkills = allSkills
    .filter((s) => s.name.toLowerCase().includes(skillSearch.toLowerCase()))
    .filter((s) => !selectedSkills.includes(s.id))
    .slice(0, 10);

  function toggleSkill(skillId: string) {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
  }

  function improveDescription() {
    if (!description.trim()) {
      toastError('Write a description first, then I can improve it.');
      return;
    }
    const improved = `${description}\n\n---\nKey deliverables:\n- Clear project scope and requirements\n- Regular progress updates\n- Source code / final deliverables included\n- Post-delivery support for revisions\n\nI'm looking for a professional who can deliver quality work on time. Please include relevant portfolio examples in your proposal.`;
    setDescription(improved);
    toastSuccess('Description enhanced with professional structure!');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.id) return;
    setSaving(true);
    const payload = {
      client_id: session.user.id,
      category_id: categoryId || null,
      title,
      description,
      budget_min: Number(budgetMin) || 0,
      budget_max: Number(budgetMax) || 0,
      deadline: deadline || null,
      experience_level: experienceLevel,
      project_type: projectType,
      status: 'open' as const,
    };
    if (isEdit && id) {
      const { error } = await supabase.from('projects').update(payload).eq('id', id);
      if (error) { toastError(error.message); setSaving(false); return; }
      await supabase.from('project_skills').delete().eq('project_id', id);
      if (selectedSkills.length > 0) {
        await supabase.from('project_skills').insert(selectedSkills.map((sid) => ({ project_id: id, skill_id: sid })));
      }
      toastSuccess('Project updated!');
      navigate(`/projects/${id}`);
    } else {
      const { data, error } = await supabase.from('projects').insert(payload).select().single();
      if (error) { toastError(error.message); setSaving(false); return; }
      const proj = data as Project;
      if (selectedSkills.length > 0) {
        await supabase.from('project_skills').insert(selectedSkills.map((sid) => ({ project_id: proj.id, skill_id: sid })));
      }
      toastSuccess('Project posted!');
      navigate(`/projects/${proj.id}`);
    }
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-600 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-2xl font-bold font-[var(--font-display)] mb-6">{isEdit ? 'Edit Project' : 'Post a Project'}</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Project Title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Build a React landing page" />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
              <button type="button" onClick={improveDescription} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Improve with AI
              </button>
            </div>
            <Textarea required rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your project in detail..." />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select label="Experience Level" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
              <option value="Entry">Entry</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Budget Min ($)" type="number" required value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="100" />
            <Input label="Budget Max ($)" type="number" required value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="500" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            <Select label="Project Type" value={projectType} onChange={(e) => setProjectType(e.target.value)}>
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly Rate</option>
            </Select>
          </div>

          {/* Skills */}
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">Required Skills</label>
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedSkills.map((sid) => {
                  const skill = allSkills.find((s) => s.id === sid);
                  return (
                    <Badge key={sid} color="primary">
                      {skill?.name}
                      <button type="button" onClick={() => toggleSkill(sid)} className="ml-1 hover:text-error-600">&times;</button>
                    </Badge>
                  );
                })}
              </div>
            )}
            <input
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              placeholder="Search skills..."
              className="w-full h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            {filteredSkills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {filteredSkills.map((s) => (
                  <button key={s.id} type="button" onClick={() => toggleSkill(s.id)} className="text-sm px-3 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-400 hover:text-primary-600 transition-colors">
                    + {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" loading={saving} size="lg" className="w-full">
            <Save className="h-4 w-4" /> {isEdit ? 'Update Project' : 'Post Project'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
