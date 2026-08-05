import {
  ChefHat, Code2, Plane, LineChart, Briefcase, Hammer,
  Gamepad2, HeartPulse, Car, Building2, BookOpen, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  ChefHat,
  Code2,
  Plane,
  LineChart,
  Briefcase,
  Hammer,
  Gamepad2,
  HeartPulse,
  Car,
  Building2,
  BookOpen,
};

const COLORS: Record<string, { bg: string; text: string; ring: string; gradient: string }> = {
  amber: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", gradient: "from-amber-400 to-orange-500" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200", gradient: "from-blue-400 to-blue-600" },
  teal: { bg: "bg-teal-50", text: "text-teal-700", ring: "ring-teal-200", gradient: "from-teal-400 to-teal-600" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", gradient: "from-emerald-400 to-emerald-600" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-200", gradient: "from-violet-400 to-violet-600" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", ring: "ring-orange-200", gradient: "from-orange-400 to-orange-600" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200", gradient: "from-rose-400 to-rose-600" },
  red: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200", gradient: "from-red-400 to-red-600" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-700", ring: "ring-cyan-200", gradient: "from-cyan-400 to-cyan-600" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-700", ring: "ring-indigo-200", gradient: "from-indigo-400 to-indigo-600" },
};

export function getCategoryIcon(iconName: string): LucideIcon {
  return ICONS[iconName] || BookOpen;
}

export function getCategoryColor(color: string) {
  return COLORS[color] || COLORS.blue;
}
