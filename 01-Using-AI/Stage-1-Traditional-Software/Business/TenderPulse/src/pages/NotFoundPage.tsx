import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl font-extrabold text-brand-600 dark:text-brand-400">404</p>
      <h1 className="mt-4 font-display text-xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">The page you're looking for doesn't exist or has been moved.</p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="btn-primary"><Home size={16} /> Go home</Link>
        <Link to="/browse" className="btn-secondary"><Search size={16} /> Browse tenders</Link>
      </div>
    </div>
  )
}
