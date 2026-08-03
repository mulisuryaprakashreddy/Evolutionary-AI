import { createBrowserRouter, Navigate } from 'react-router-dom'
import Index from './pages/Index'
import Auth from './pages/Auth'
import Schedule from './pages/Schedule'
import Learn from './pages/Learn'
import Centers from './pages/Centers'
import Profile from './pages/Profile'
import { useAuth } from '@/hooks/useAuth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  { path: '/', element: <Index /> },
  { path: '/auth', element: <Auth /> },
  { path: '/schedule', element: <Schedule /> },
  { path: '/learn', element: <Learn /> },
  { path: '/centers', element: <Centers /> },
  { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
])

export default function App() {
  return <Index />
}
