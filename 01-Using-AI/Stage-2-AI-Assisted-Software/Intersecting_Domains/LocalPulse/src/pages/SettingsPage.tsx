import { useState } from 'react';
import { Bot, Key, Check, AlertCircle, ExternalLink, Trash2, Sparkles, ArrowLeft } from 'lucide-react';
import { getApiKey, setApiKey, getModel, setModel, getBaseUrl, setBaseUrl, DEFAULT_MODEL, DEFAULT_BASE_URL, hasApiKey } from '@/lib/ai';
import { useToast } from '@/context/ToastContext';
import { Button, Card } from '@/components/ui';
import { navigateTo } from '@/lib/router';

export function SettingsPage() {
  const toast = useToast();
  const [key, setKey] = useState(getApiKey() ?? '');
  const [model, setModelState] = useState(getModel());
  const [baseUrl, setBaseUrlState] = useState(getBaseUrl());
  const [saved, setSaved] = useState(hasApiKey());

  const save = () => {
    setApiKey(key);
    setModel(model);
    setBaseUrl(baseUrl);
    setSaved(!!key.trim());
    toast('success', 'AI settings saved. Your API key is stored only in your browser.');
  };

  const clearKey = () => {
    setApiKey('');
    setKey('');
    setSaved(false);
    toast('info', 'API key removed.');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => navigateTo('/')} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 dark:text-slate-400">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          <Bot className="h-7 w-7 text-teal-600 dark:text-teal-400" /> AI Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Bring your own AI API key. It is stored only in your browser and sent directly to the AI provider — never to our servers or database.
        </p>
      </div>

      {/* Status */}
      <Card className={`mb-6 p-4 ${saved ? 'border-emerald-200 dark:border-emerald-500/30' : 'border-amber-200 dark:border-amber-500/30'}`}>
        <div className="flex items-center gap-3">
          {saved ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
              <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {saved ? 'AI is active' : 'AI is not configured'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {saved ? 'You can use AI summaries, solutions, insights, and the chat assistant.' : 'Add an API key below to unlock AI features.'}
            </p>
          </div>
        </div>
      </Card>

      {/* API key */}
      <Card className="mb-6 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
          <Key className="h-5 w-5 text-teal-600 dark:text-teal-400" /> API Key
        </h2>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">OpenAI-compatible API Key</label>
        <div className="flex gap-2">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-…"
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {saved && (
            <Button variant="outline" onClick={clearKey}>
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Works with OpenAI and any OpenAI-compatible provider (e.g. Groq, Together, OpenRouter). Your key stays in your browser's local storage.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Model</label>
            <input
              value={model}
              onChange={(e) => setModelState(e.target.value)}
              placeholder={DEFAULT_MODEL}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-slate-400">Default: {DEFAULT_MODEL}</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Base URL</label>
            <input
              value={baseUrl}
              onChange={(e) => setBaseUrlState(e.target.value)}
              placeholder={DEFAULT_BASE_URL}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-slate-400">Default: {DEFAULT_BASE_URL}</p>
          </div>
        </div>

        <Button onClick={save} className="mt-5">
          <Check className="h-4 w-4" /> Save Settings
        </Button>
      </Card>

      {/* Features */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
          <Sparkles className="h-5 w-5 text-teal-600 dark:text-teal-400" /> What AI Can Do
        </h2>
        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <Feature label="Report Summaries" desc="AI summarizes any report's impact and urgency." />
          <Feature label="Suggested Solutions" desc="Practical, evidence-based recommendations per report." />
          <Feature label="Community Insights" desc="Plain-language summaries of an area's strengths and concerns." />
          <Feature label="Health Score Explanation" desc="Understand how a community's 0–100 score was calculated." />
          <Feature label="AI Chat Assistant" desc="Ask questions and get answers grounded in real reports." />
        </ul>
      </Card>

      <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
        <p>
          Don't have an API key? Get one from{' '}
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-medium text-teal-600 hover:underline dark:text-teal-400">
            OpenAI <ExternalLink className="h-3 w-3" />
          </a>
          . Other OpenAI-compatible providers also work.
        </p>
      </div>
    </div>
  );
}

function Feature({ label, desc }: { label: string; desc: string }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
    </li>
  );
}
