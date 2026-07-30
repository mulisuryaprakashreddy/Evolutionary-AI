import { Home, Flame, Compass, Music, GamepadIcon, Newspaper, Trophy, Lightbulb, Settings, Flag, HelpCircle, ThumbsUp, Clock, History, ListVideo } from 'lucide-react';
import { useRouter } from '@/lib/router';

interface SidebarProps {
  collapsed: boolean;
  onNavigate: () => void;
}

const mainLinks = [
  { label: 'Home', icon: Home, route: { name: 'home' } as const },
  { label: 'Trending', icon: Flame, route: { name: 'trending' } as const },
  { label: 'Explore', icon: Compass, route: null },
  { label: 'Music', icon: Music, route: null },
  { label: 'Gaming', icon: GamepadIcon, route: null },
  { label: 'News', icon: Newspaper, route: null },
  { label: 'Sports', icon: Trophy, route: null },
  { label: 'Learning', icon: Lightbulb, route: null },
];

const secondaryLinks = [
  { label: 'History', icon: History },
  { label: 'Your videos', icon: ListVideo },
  { label: 'Watch later', icon: Clock },
  { label: 'Liked videos', icon: ThumbsUp },
];

const footerLinks = [
  { label: 'Settings', icon: Settings },
  { label: 'Report history', icon: Flag },
  { label: 'Help', icon: HelpCircle },
];

export default function Sidebar({ collapsed, onNavigate }: SidebarProps) {
  const { route, navigate } = useRouter();
  const currentName = route.name;

  if (collapsed) {
    return (
      <aside className="fixed left-0 top-14 z-40 hidden h-[calc(100vh-3.5rem)] w-20 flex-col items-center gap-1 overflow-y-auto bg-brand-bg py-3 md:flex">
        {mainLinks.slice(0, 4).map((link) => {
          const Icon = link.icon;
          const active = currentName === link.route?.name;
          return (
            <button
              key={link.label}
              onClick={() => {
                if (link.route) {
                  navigate(link.route);
                  onNavigate();
                }
              }}
              className={`flex w-16 flex-col items-center gap-1.5 rounded-lg px-1 py-4 transition-colors hover:bg-brand-hover ${
                active ? 'bg-brand-hover' : ''
              }`}
            >
              <Icon className="h-6 w-6 text-white" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] leading-tight text-brand-subtle">{link.label}</span>
            </button>
          );
        })}
      </aside>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 md:hidden"
        onClick={onNavigate}
      />
      <aside className="fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-60 overflow-y-auto bg-brand-bg pb-8 animate-slide-down md:animate-none">
        <nav className="px-3 py-2">
          {mainLinks.map((link) => {
            const Icon = link.icon;
            const active = currentName === link.route?.name;
            return (
              <button
                key={link.label}
                onClick={() => {
                  if (link.route) {
                    navigate(link.route);
                    onNavigate();
                  }
                }}
                className={`flex w-full items-center gap-6 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-brand-hover ${
                  active ? 'bg-brand-hover font-medium' : 'text-white'
                }`}
              >
                <Icon className="h-6 w-6 shrink-0" strokeWidth={active ? 2.5 : 2} />
                {link.label}
              </button>
            );
          })}
        </nav>

        <div className="mx-3 border-t border-brand-border" />

        <nav className="px-3 py-2">
          <h3 className="px-3 py-1 text-base font-medium text-white">You</h3>
          {secondaryLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                className="flex w-full items-center gap-6 rounded-lg px-3 py-2.5 text-sm text-white transition-colors hover:bg-brand-hover"
              >
                <Icon className="h-6 w-6 shrink-0" />
                {link.label}
              </button>
            );
          })}
        </nav>

        <div className="mx-3 border-t border-brand-border" />

        <nav className="px-3 py-2">
          {footerLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                className="flex w-full items-center gap-6 rounded-lg px-3 py-2.5 text-sm text-white transition-colors hover:bg-brand-hover"
              >
                <Icon className="h-6 w-6 shrink-0" />
                {link.label}
              </button>
            );
          })}
        </nav>

        <div className="mx-3 border-t border-brand-border" />

        <div className="px-6 py-3 text-xs leading-5 text-brand-subtle-2">
          <p className="font-medium text-brand-subtle">About · Press · Copyright</p>
          <p className="font-medium text-brand-subtle">Contact · Creators</p>
          <p className="mt-4">© 2026 ClipShare LLC</p>
        </div>
      </aside>
    </>
  );
}
