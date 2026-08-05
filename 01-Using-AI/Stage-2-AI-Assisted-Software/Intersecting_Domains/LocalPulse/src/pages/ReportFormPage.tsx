import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { CATEGORIES, SEVERITIES, RECURRENCES } from '@/lib/constants';
import type { Severity, Recurrence } from '@/types';
import { Button, Card, Spinner } from '@/components/ui';
import { navigateTo } from '@/lib/router';
import {
  FileText, MapPin, ImagePlus, AlertTriangle, Users, Calendar, Eye, EyeOff,
  Check, ArrowLeft, Loader2,
} from 'lucide-react';

export function ReportFormPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [recurrence, setRecurrence] = useState<Recurrence>('one_time');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [village, setVillage] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [dateObserved, setDateObserved] = useState(new Date().toISOString().split('T')[0]);
  const [peopleAffected, setPeopleAffected] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [photoInput, setPhotoInput] = useState('');

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <FileText className="mx-auto h-12 w-12 text-slate-300" />
        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Sign in to report a problem</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">You need an account to submit community reports.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigateTo('/auth/signin')}>Sign In</Button>
          <Button variant="outline" onClick={() => navigateTo('/auth/signup')}>Create Account</Button>
        </div>
      </div>
    );
  }

  const addPhoto = () => {
    const url = photoInput.trim();
    if (url && photoUrls.length < 6) {
      setPhotoUrls((p) => [...p, url]);
      setPhotoInput('');
    }
  };

  const removePhoto = (i: number) => setPhotoUrls((p) => p.filter((_, idx) => idx !== i));

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast('error', 'Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(+pos.coords.latitude.toFixed(4));
        setLongitude(+pos.coords.longitude.toFixed(4));
        setLocating(false);
        toast('success', 'Location captured.');
      },
      () => {
        setLocating(false);
        toast('error', 'Could not get your location. Please enter coordinates manually.');
      }
    );
  };

  const valid = title.trim() && category && description.trim() && country.trim() && city.trim() && latitude !== '' && longitude !== '';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      toast('error', 'Please fill in all required fields including location.');
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from('reports')
      .insert({
        title: title.trim(),
        category,
        description: description.trim(),
        severity,
        recurrence,
        is_anonymous: isAnonymous,
        photos: photoUrls,
        video_url: videoUrl.trim() || null,
        country: country.trim(),
        state: state.trim() || null,
        district: district.trim() || null,
        city: city.trim(),
        village: village.trim() || null,
        postal_code: postalCode.trim() || null,
        latitude: Number(latitude),
        longitude: Number(longitude),
        date_observed: dateObserved,
        people_affected: peopleAffected,
      })
      .select('id')
      .single();

    setSubmitting(false);
    if (error) {
      toast('error', 'Could not submit your report. Please try again.');
      return;
    }
    toast('success', 'Report submitted! It is now public on LocalPulse.');
    navigateTo(`/reports/${data.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => navigateTo('/explore')} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 dark:text-slate-400">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Report a Problem</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Document a community issue so others can find, vote on, and help resolve it.</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Basic info */}
        <Card className="p-6">
          <SectionTitle icon={<FileText className="h-4 w-4" />}>Problem Details</SectionTitle>
          <Field label="Title" required>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Potholes on Main Street" className={inputCls} maxLength={120} />
          </Field>
          <Field label="Category" required>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const active = category === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                      active
                        ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Description" required>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the problem in detail. When did it start? Who is affected? What is the impact?" className={inputCls} maxLength={2000} />
            <p className="mt-1 text-right text-xs text-slate-400">{description.length}/2000</p>
          </Field>
        </Card>

        {/* Severity & context */}
        <Card className="p-6">
          <SectionTitle icon={<AlertTriangle className="h-4 w-4" />}>Severity & Context</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Severity" required>
              <div className="grid grid-cols-2 gap-2">
                {SEVERITIES.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSeverity(s.id)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                      severity === s.id
                        ? `${s.ring} ${s.color} border-current`
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Is the issue ongoing?">
              <div className="flex gap-2">
                {RECURRENCES.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setRecurrence(r.id)}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                      recurrence === r.id
                        ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Date Observed">
              <input type="date" value={dateObserved} onChange={(e) => setDateObserved(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Estimated People Affected">
              <input type="number" min={1} value={peopleAffected} onChange={(e) => setPeopleAffected(Math.max(1, +e.target.value))} className={inputCls} />
            </Field>
          </div>
          <Field label="Visibility">
            <button
              type="button"
              onClick={() => setIsAnonymous((v) => !v)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                isAnonymous
                  ? 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
                  : 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'
              }`}
            >
              {isAnonymous ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isAnonymous ? 'Anonymous' : 'Public (show my name)'}
            </button>
          </Field>
        </Card>

        {/* Media */}
        <Card className="p-6">
          <SectionTitle icon={<ImagePlus className="h-4 w-4" />}>Photos & Video</SectionTitle>
          <Field label="Photo URLs (max 6)">
            <div className="flex gap-2">
              <input
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                placeholder="Paste an image URL…"
                className={inputCls}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPhoto(); } }}
              />
              <Button type="button" variant="outline" onClick={addPhoto} disabled={photoUrls.length >= 6}>Add</Button>
            </div>
            {photoUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {photoUrls.map((url, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                    <img src={url} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.2'; }} />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="text-xs text-white">Remove</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>
          <Field label="Video URL (optional)">
            <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="YouTube or video link" className={inputCls} />
          </Field>
        </Card>

        {/* Location */}
        <Card className="p-6">
          <SectionTitle icon={<MapPin className="h-4 w-4" />}>Location</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Country" required>
              <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. India" className={inputCls} />
            </Field>
            <Field label="State / Province">
              <input value={state} onChange={(e) => setState(e.target.value)} className={inputCls} />
            </Field>
            <Field label="District / County">
              <input value={district} onChange={(e) => setDistrict(e.target.value)} className={inputCls} />
            </Field>
            <Field label="City" required>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Bengaluru" className={inputCls} />
            </Field>
            <Field label="Village / Neighborhood">
              <input value={village} onChange={(e) => setVillage(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Postal Code">
              <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="GPS Coordinates" required>
            <div className="flex flex-wrap items-center gap-2">
              <input type="number" value={latitude} onChange={(e) => setLatitude(e.target.value === '' ? '' : +e.target.value)} placeholder="Latitude" step="0.0001" className={`${inputCls} w-36`} />
              <input type="number" value={longitude} onChange={(e) => setLongitude(e.target.value === '' ? '' : +e.target.value)} placeholder="Longitude" step="0.0001" className={`${inputCls} w-36`} />
              <Button type="button" variant="outline" onClick={useMyLocation} disabled={locating}>
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                Use my location
              </Button>
            </div>
          </Field>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => navigateTo('/explore')}>Cancel</Button>
          <Button type="submit" disabled={!valid || submitting}>
            {submitting ? <Spinner className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            Submit Report
          </Button>
        </div>
      </form>

      <style>{`
        .lp-input{width:100%;border-radius:0.75rem;border:1px solid rgb(203 213 225);background:white;padding:0.625rem 0.875rem;font-size:0.875rem;outline:none;color:rgb(15 23 42);transition:border-color .15s,box-shadow .15s}
        .dark .lp-input{border-color:rgb(51 65 85);background:rgb(30 41 59);color:white}
        .lp-input:focus{border-color:rgb(20 184 166);box-shadow:0 0 0 3px rgba(20,184,166,0.15)}
        .lp-input::placeholder{color:rgb(148 163 184)}
      `}</style>
    </div>
  );
}

const inputCls = 'lp-input';

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">{icon}</span>
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">{children}</h2>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
