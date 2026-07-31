import { FileText, Sparkles, Download, Shield, Zap, Eye, CheckCircle2, ArrowRight } from 'lucide-react';
import { navigate } from '@/lib/router';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    { icon: FileText, title: '10 Professional Templates', desc: 'Choose from modern, classic, minimal, executive and more — all ATS-friendly.' },
    { icon: Sparkles, title: 'Smart Suggestions', desc: 'Get instant suggestions to strengthen your bullet points and summary.' },
    { icon: Shield, title: 'ATS Score Checker', desc: 'See how well your resume performs against applicant tracking systems.' },
    { icon: Download, title: 'One-Click PDF Download', desc: 'Export a polished, print-ready PDF in seconds — no watermarks.' },
    { icon: Eye, title: 'Live Preview', desc: 'Watch your resume update in real time as you type.' },
    { icon: Zap, title: 'Fast & Free to Start', desc: 'Create an account and build your first resume in minutes, at no cost.' },
  ];

  const steps = [
    { num: '01', title: 'Sign Up Free', desc: 'Create your account with just an email and password.' },
    { num: '02', title: 'Build Your Resume', desc: 'Add your experience, education, and skills with our guided editor.' },
    { num: '03', title: 'Pick a Template', desc: 'Choose from 10 professional designs and see a live preview.' },
    { num: '04', title: 'Download & Apply', desc: 'Export as PDF and start applying to jobs with confidence.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-semibold text-lg tracking-tight">ResumeForge</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium text-sm transition-colors"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium text-sm transition-colors"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
             Smart resume builder
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Build a resume that
            <br />
            <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
              gets you hired
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
             Create a professional resume in minutes with smart suggestions, ATS scoring,
            and 10 beautiful templates. Free to start — no credit card required.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              className="group px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold transition-colors flex items-center gap-2"
            >
              {user ? 'Open Dashboard' : 'Start Building Free'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-200 font-medium transition-colors"
            >
              I already have an account
            </button>
          </div>
          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-500 flex-wrap">
            {['No credit card needed', '10 free templates', 'PDF download', 'ATS-friendly'].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Everything you need to land the job</h2>
            <p className="text-slate-400">Powerful features wrapped in a simple, intuitive editor.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-sky-500/30 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-sky-500/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-sky-400" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-6 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">From blank page to hired in 4 steps</h2>
            <p className="text-slate-400">No design skills needed. Just follow the prompts.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="relative">
                <div className="text-4xl font-bold text-sky-500/30 mb-2">{num}</div>
                <h3 className="font-semibold mb-1.5">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to build your resume?</h2>
          <p className="text-slate-400 mb-8">
            Join thousands of job seekers who've built standout resumes with ResumeForge.
          </p>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/register')}
            className="px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold transition-colors inline-flex items-center gap-2"
          >
            {user ? 'Go to Dashboard' : 'Create Your Free Resume'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center">
              <FileText className="w-4 h-4 text-slate-950" />
            </div>
            <span className="font-medium">ResumeForge</span>
          </div>
          <p className="text-sm text-slate-500">Built for job seekers.</p>
        </div>
      </footer>
    </div>
  );
}
