import { useEffect, useState } from 'react';
import { FileText, Plus, Trash2, LogOut, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { navigate } from '@/lib/router';
import { emptyResumeData, type Resume } from '@/types/resume';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadResumes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data) setResumes(data as Resume[]);
    setLoading(false);
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const createResume = async () => {
    setCreating(true);
    const { data, error } = await supabase
      .from('resumes')
      .insert({ title: 'Untitled Resume', template: 'modern', data: emptyResumeData })
      .select()
      .single();
    setCreating(false);
    if (error || !data) return;
    navigate(`/editor/${data.id}`);
  };

  const deleteResume = async (id: string) => {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    await supabase.from('resumes').delete().eq('id', id);
    setResumes((r) => r.filter((res) => res.id !== id));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center">
              <FileText className="w-4 h-4 text-slate-950" />
            </div>
            <span className="font-semibold tracking-tight">ResumeForge</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:block">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Resumes</h1>
            <p className="text-sm text-slate-400 mt-1">
              {resumes.length} resume{resumes.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <button
            onClick={createResume}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold text-sm transition-colors"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            New Resume
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-slate-800 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-slate-600" />
            </div>
            <h3 className="font-semibold text-lg mb-1.5">No resumes yet</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
              Create your first resume and start building your path to a new job.
            </p>
            <button
              onClick={createResume}
              disabled={creating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Resume
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="group p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-sky-500/30 transition-colors"
              >
                <button
                  onClick={() => navigate(`/editor/${resume.id}`)}
                  className="block w-full text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-sky-400" />
                    </div>
                    <span className="text-xs text-slate-500 capitalize px-2 py-0.5 rounded bg-slate-800">
                      {resume.template}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1 truncate group-hover:text-sky-300 transition-colors">
                    {resume.title || 'Untitled Resume'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(resume.updated_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </button>
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/editor/${resume.id}`)}
                    className="text-sm text-sky-400 hover:text-sky-300 font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteResume(resume.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                    aria-label="Delete resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
