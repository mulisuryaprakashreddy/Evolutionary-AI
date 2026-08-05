import { useState } from "react";
import { KeyRound, Check, Eye, EyeOff, Shield, Trash2, ExternalLink, Globe, GraduationCap } from "lucide-react";
import { getApiKey, setApiKey, getLearningMode, setLearningMode, getLanguage, setLanguage } from "@/lib/storage";
import type { LearningMode } from "@/lib/types";

type Props = {
  onApiKeyChange: (hasKey: boolean) => void;
};

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "hi", label: "हिन्दी" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ar", label: "العربية" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
];

export default function SettingsPage({ onApiKeyChange }: Props) {
  const [key, setKey] = useState(getApiKey());
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState<LearningMode>(getLearningMode());
  const [language, setLanguageState] = useState(getLanguage());

  const handleSaveKey = () => {
    setApiKey(key.trim());
    onApiKeyChange(!!key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleModeChange = (m: LearningMode) => {
    setMode(m);
    setLearningMode(m);
  };

  const handleLanguageChange = (code: string) => {
    setLanguageState(code);
    setLanguage(code);
  };

  const handleClearKey = () => {
    setKey("");
    setApiKey("");
    onApiKeyChange(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center py-2">
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-ink-900 mb-2">Settings</h1>
        <p className="text-ink-500 text-sm">Configure your AI assistant and preferences.</p>
      </div>

      {/* API Key */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-bold text-ink-900">AI API Key</h2>
        </div>
        <p className="text-sm text-ink-500 mb-4">
          Add your OpenAI API key to power the AI Assistant. Your key is stored only in your
          browser's local storage and is sent exclusively to OpenAI — never to our servers.
        </p>

        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-..."
            className="input-field pr-12 font-mono text-sm"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button onClick={handleSaveKey} className="btn-primary">
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              "Save Key"
            )}
          </button>
          {key && (
            <button onClick={handleClearKey} className="btn-ghost text-red-500 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          )}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-ink-50 border border-ink-100">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-ink-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-ink-500 leading-relaxed">
              Your API key never leaves your browser except to call OpenAI directly.
              We do not store, log, or transmit it anywhere else. You can remove it anytime.
            </p>
          </div>
        </div>

        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          Get an OpenAI API key
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Learning mode */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-bold text-ink-900">Learning Mode</h2>
        </div>
        <p className="text-sm text-ink-500 mb-4">
          The AI adapts its explanations to your level. Switch anytime.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(["beginner", "intermediate", "expert"] as LearningMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`p-4 rounded-xl border text-center transition-all ${
                mode === m
                  ? "border-brand-400 bg-brand-50 text-brand-700"
                  : "border-ink-200 text-ink-600 hover:border-ink-300"
              }`}
            >
              <div className="font-semibold text-sm capitalize">{m}</div>
              <div className="text-xs text-ink-400 mt-1">
                {m === "beginner" && "Simple language"}
                {m === "intermediate" && "Some terms"}
                {m === "expert" && "Advanced jargon"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-bold text-ink-900">Language</h2>
        </div>
        <p className="text-sm text-ink-500 mb-4">
          The AI can generate answers in your preferred language.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                language === lang.code
                  ? "border-brand-400 bg-brand-50 text-brand-700"
                  : "border-ink-200 text-ink-600 hover:border-ink-300"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
