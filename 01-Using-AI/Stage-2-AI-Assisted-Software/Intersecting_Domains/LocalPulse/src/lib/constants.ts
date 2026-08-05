import {
  Droplets, Route, Bus, Trash2, Recycle, GitBranch, Waves, Zap,
  Lightbulb, Wifi, HeartPulse, GraduationCap, Leaf, Wind, Volume2,
  Shield, Siren, PawPrint, Trees, Building, Landmark, Home,
  Accessibility, HardHat, Wheat, Briefcase, MoreHorizontal,
} from 'lucide-react';
import type { IconType } from './types-extra';
import type { Severity, ReportStatus } from '@/types';

export const CATEGORIES: { id: string; label: string; icon: IconType }[] = [
  { id: 'Water Supply', label: 'Water Supply', icon: Droplets },
  { id: 'Roads', label: 'Roads', icon: Route },
  { id: 'Transportation', label: 'Transportation', icon: Bus },
  { id: 'Waste Management', label: 'Waste Management', icon: Trash2 },
  { id: 'Garbage Collection', label: 'Garbage Collection', icon: Recycle },
  { id: 'Drainage', label: 'Drainage', icon: GitBranch },
  { id: 'Flooding', label: 'Flooding', icon: Waves },
  { id: 'Electricity', label: 'Electricity', icon: Zap },
  { id: 'Street Lighting', label: 'Street Lighting', icon: Lightbulb },
  { id: 'Internet', label: 'Internet', icon: Wifi },
  { id: 'Healthcare', label: 'Healthcare', icon: HeartPulse },
  { id: 'Education', label: 'Education', icon: GraduationCap },
  { id: 'Environment', label: 'Environment', icon: Leaf },
  { id: 'Air Pollution', label: 'Air Pollution', icon: Wind },
  { id: 'Noise Pollution', label: 'Noise Pollution', icon: Volume2 },
  { id: 'Public Safety', label: 'Public Safety', icon: Shield },
  { id: 'Crime', label: 'Crime', icon: Siren },
  { id: 'Animal Issues', label: 'Animal Issues', icon: PawPrint },
  { id: 'Parks', label: 'Parks', icon: Trees },
  { id: 'Public Toilets', label: 'Public Toilets', icon: Building },
  { id: 'Government Services', label: 'Government Services', icon: Landmark },
  { id: 'Housing', label: 'Housing', icon: Home },
  { id: 'Accessibility', label: 'Accessibility', icon: Accessibility },
  { id: 'Infrastructure', label: 'Infrastructure', icon: HardHat },
  { id: 'Agriculture', label: 'Agriculture', icon: Wheat },
  { id: 'Employment', label: 'Employment', icon: Briefcase },
  { id: 'Other', label: 'Other', icon: MoreHorizontal },
];

export function getCategoryIcon(id: string): IconType {
  return CATEGORIES.find((c) => c.id === id)?.icon ?? MoreHorizontal;
}

export const SEVERITIES: { id: Severity; label: string; color: string; ring: string; dot: string }[] = [
  { id: 'low', label: 'Low', color: 'text-emerald-700 dark:text-emerald-300', ring: 'bg-emerald-100 dark:bg-emerald-500/15', dot: 'bg-emerald-500' },
  { id: 'medium', label: 'Medium', color: 'text-amber-700 dark:text-amber-300', ring: 'bg-amber-100 dark:bg-amber-500/15', dot: 'bg-amber-500' },
  { id: 'high', label: 'High', color: 'text-orange-700 dark:text-orange-300', ring: 'bg-orange-100 dark:bg-orange-500/15', dot: 'bg-orange-500' },
  { id: 'critical', label: 'Critical', color: 'text-red-700 dark:text-red-300', ring: 'bg-red-100 dark:bg-red-500/15', dot: 'bg-red-500' },
];

export const STATUSES: { id: ReportStatus; label: string; color: string }[] = [
  { id: 'reported', label: 'Reported', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300' },
  { id: 'verified', label: 'Verified', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  { id: 'under_review', label: 'Under Review', color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  { id: 'resolved', label: 'Resolved', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  { id: 'closed', label: 'Closed', color: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400' },
  { id: 'reopened', label: 'Reopened', color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
];

export const RECURRENCES = [
  { id: 'one_time', label: 'One-time' },
  { id: 'recurring', label: 'Recurring' },
  { id: 'continuous', label: 'Continuous' },
] as const;

export function severityMeta(s: Severity) {
  return SEVERITIES.find((x) => x.id === s) ?? SEVERITIES[1];
}

export function statusMeta(s: ReportStatus) {
  return STATUSES.find((x) => x.id === s) ?? STATUSES[0];
}

export const HEALTH_DIMENSIONS = [
  'Water Availability', 'Road Conditions', 'Public Transportation',
  'Electricity Reliability', 'Internet Connectivity', 'Waste Management',
  'Cleanliness', 'Drainage', 'Flood Risk', 'Air Quality', 'Noise Pollution',
  'Public Safety', 'Healthcare Accessibility', 'Education Infrastructure',
  'Accessibility', 'Parks and Public Spaces', 'Environmental Health',
  'Government Response Time', 'Community Participation',
] as const;

// Map categories to health dimensions for scoring
export const CATEGORY_TO_DIMENSION: Record<string, string> = {
  'Water Supply': 'Water Availability',
  'Roads': 'Road Conditions',
  'Transportation': 'Public Transportation',
  'Electricity': 'Electricity Reliability',
  'Internet': 'Internet Connectivity',
  'Waste Management': 'Waste Management',
  'Garbage Collection': 'Waste Management',
  'Cleanliness': 'Cleanliness',
  'Drainage': 'Drainage',
  'Flooding': 'Flood Risk',
  'Air Pollution': 'Air Quality',
  'Noise Pollution': 'Noise Pollution',
  'Public Safety': 'Public Safety',
  'Crime': 'Public Safety',
  'Healthcare': 'Healthcare Accessibility',
  'Education': 'Education Infrastructure',
  'Accessibility': 'Accessibility',
  'Parks': 'Parks and Public Spaces',
  'Environment': 'Environmental Health',
  'Street Lighting': 'Public Safety',
  'Animal Issues': 'Public Safety',
  'Government Services': 'Government Response Time',
};

export function healthBand(score: number) {
  if (score >= 90) return { label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-500' };
  if (score >= 80) return { label: 'Very Good', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-500' };
  if (score >= 70) return { label: 'Good', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', ring: 'ring-amber-500' };
  if (score >= 60) return { label: 'Needs Improvement', color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300', ring: 'ring-orange-500' };
  if (score >= 40) return { label: 'Poor', color: 'text-red-500 dark:text-red-400', bg: 'bg-red-500', text: 'text-red-700 dark:text-red-300', ring: 'ring-red-500' };
  return { label: 'Critical', color: 'text-red-600 dark:text-red-500', bg: 'bg-red-600', text: 'text-red-700 dark:text-red-300', ring: 'ring-red-600' };
}
