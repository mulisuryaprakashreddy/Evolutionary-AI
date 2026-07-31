import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useRouter, navigate, type Route } from '@/lib/router';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import Editor from '@/pages/Editor';
import { useEffect } from 'react';

function RouteGuard({ route }: { route: Route }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const authed = !!user;
    if ((route.name === 'dashboard' || route.name === 'editor') && !authed) {
      navigate('/login');
    }
    if ((route.name === 'login' || route.name === 'register') && authed) {
      navigate('/dashboard');
    }
  }, [route, user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  switch (route.name) {
    case 'landing': return <LandingPage />;
    case 'login': return <AuthPage mode="login" />;
    case 'register': return <AuthPage mode="register" />;
    case 'dashboard': return <Dashboard />;
    case 'editor': return <Editor resumeId={route.resumeId} />;
    default: return <LandingPage />;
  }
}

export default function App() {
  const route = useRouter();
  return (
    <AuthProvider>
      <RouteGuard route={route} />
    </AuthProvider>
  );
}
