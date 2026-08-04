import {
  Camera, Car, Laptop, Gamepad2, Drill, Tent, Bike, Music, Watch, Sofa,
  BookOpen, Projector, Smartphone, Package, type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  Camera, Car, Laptop, Gamepad2, Drill, Tent, Bike, Music, Watch, Sofa,
  BookOpen, Projector, Smartphone, Package,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = MAP[name] ?? Package;
  return <Icon className={className} />;
}
