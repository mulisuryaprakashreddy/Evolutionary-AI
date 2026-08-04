import { useState, useEffect } from 'react';
import { RouterProvider, useRouter } from '@/lib/router';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import HomePage from '@/pages/HomePage';
import WatchPage from '@/pages/WatchPage';
import ChannelPage from '@/pages/ChannelPage';
import SearchPage from '@/pages/SearchPage';
import TrendingPage from '@/pages/TrendingPage';

function AppContent() {
  const { route } = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [route]);

  // On desktop, collapse sidebar on watch page; expand otherwise
  useEffect(() => {
    setSidebarCollapsed(route.name === 'watch');
  }, [route.name]);

  const handleMenuClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const isWatchPage = route.name === 'watch';
  const isChannelPage = route.name === 'channel';
  const isFullBleed = isChannelPage;

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header onMenuClick={handleMenuClick} />

      {sidebarOpen && (
        <Sidebar collapsed={false} onNavigate={() => setSidebarOpen(false)} />
      )}
      {!sidebarOpen && (
        <Sidebar collapsed={sidebarCollapsed} onNavigate={() => setSidebarCollapsed(true)} />
      )}

      <main
        className={`pt-14 transition-all duration-200 ${
          sidebarCollapsed ? 'md:pl-20' : 'md:pl-60'
        }`}
      >
        <div
          className={
            isFullBleed
              ? ''
              : isWatchPage
              ? 'mx-auto max-w-[1800px] px-4 py-4'
              : 'mx-auto max-w-[1800px] px-4 py-4'
          }
        >
          {route.name === 'home' && <HomePage />}
          {route.name === 'watch' && <WatchPage videoId={route.videoId} />}
          {route.name === 'channel' && <ChannelPage channelId={route.channelId} />}
          {route.name === 'search' && <SearchPage query={route.query} />}
          {route.name === 'trending' && <TrendingPage />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
