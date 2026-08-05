import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { useRoute, matchRoute } from '@/lib/router';
import { Header, Footer } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { ExplorePage } from '@/pages/ExplorePage';
import { MapPage } from '@/pages/MapPage';
import { ReportFormPage } from '@/pages/ReportFormPage';
import { ReportDetailPage } from '@/pages/ReportDetailPage';
import { RankingsPage } from '@/pages/RankingsPage';
import { CommunityPage } from '@/pages/CommunityPage';
import { ChatPage } from '@/pages/ChatPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AuthPage } from '@/pages/AuthPage';
import { Button } from '@/components/ui';
import { navigateTo } from '@/lib/router';

function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-6xl font-bold text-slate-200 dark:text-slate-800">404</p>
      <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">The page you're looking for doesn't exist.</p>
      <Button className="mt-6" onClick={() => navigateTo('/')}>Back to Home</Button>
    </div>
  );
}

function Routes() {
  const [path] = useRoute();
  const route = matchRoute(path);
  const query = path.includes('?') ? new URLSearchParams(path.split('?')[1]) : new URLSearchParams();

  const hideFooter = route.name === 'chat';

  let page: React.ReactNode;
  switch (route.name) {
    case 'home': page = <HomePage />; break;
    case 'explore': page = <ExplorePage initialQuery={query.get('q') ?? ''} />; break;
    case 'map': page = <MapPage />; break;
    case 'report-new': page = <ReportFormPage />; break;
    case 'report-detail': page = <ReportDetailPage id={route.params.id} />; break;
    case 'rankings': page = <RankingsPage />; break;
    case 'community': page = <CommunityPage city={route.params.city} />; break;
    case 'chat': page = <ChatPage />; break;
    case 'settings': page = <SettingsPage />; break;
    case 'dashboard': page = <DashboardPage />; break;
    case 'auth': page = <AuthPage mode={route.params.mode as 'signin' | 'signup'} />; break;
    default: page = <NotFoundPage />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header currentPath={path} />
      <main className="flex-1">{page}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Routes />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
