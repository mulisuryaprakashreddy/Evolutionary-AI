import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FullPageSpinner } from '@/components/ui';
import { Toaster } from '@/components/Toaster';
import { LandingPage } from '@/pages/Landing';
import { LoginPage } from '@/pages/Login';
import { SignupPage } from '@/pages/Signup';
import { BrowseProjects } from '@/pages/BrowseProjects';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { PostProject } from '@/pages/PostProject';
import { BrowseFreelancers } from '@/pages/BrowseFreelancers';
import { FreelancerProfile } from '@/pages/FreelancerProfile';
import { ClientDashboard } from '@/pages/ClientDashboard';
import { FreelancerDashboard } from '@/pages/FreelancerDashboard';
import { Messages } from '@/pages/Messages';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { ProfileSettings } from '@/pages/ProfileSettings';
import { type ReactNode } from 'react';

function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { session, profile, loading } = useAuth();
  if (loading) return <FullPageSpinner message="Loading..." />;
  if (!session) return <Navigate to="/login" replace />;
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/projects" element={<BrowseProjects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/freelancers" element={<BrowseFreelancers />} />
      <Route path="/freelancers/:id" element={<FreelancerProfile />} />
      <Route
        path="/projects/new"
        element={
          <ProtectedRoute roles={['client']}>
            <PostProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id/edit"
        element={
          <ProtectedRoute roles={['client']}>
            <PostProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client"
        element={
          <ProtectedRoute roles={['client']}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/freelancer"
        element={
          <ProtectedRoute roles={['freelancer']}>
            <FreelancerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppShell() {
  const { loading } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {loading ? <FullPageSpinner message="Loading..." /> : <AppRoutes />}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
