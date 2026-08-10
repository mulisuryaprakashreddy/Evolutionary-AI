import { Link } from 'react-router-dom'
import { Building2, Mail, Phone, MapPin, Twitter, Linkedin, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Building2 size={20} />
              </div>
              <span className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                TenderPulse<span className="text-brand-600 dark:text-brand-400">AI</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Discover government tenders, contracts, and procurement opportunities with AI-powered recommendations tailored to your business.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-brand-600 hover:text-white dark:bg-slate-800 dark:text-slate-400"><Twitter size={16} /></a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-brand-600 hover:text-white dark:bg-slate-800 dark:text-slate-400"><Linkedin size={16} /></a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-brand-600 hover:text-white dark:bg-slate-800 dark:text-slate-400"><Facebook size={16} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Platform</h4>
            <ul className="mt-4 space-y-2.5">
              <li><Link to="/browse" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">Browse Tenders</Link></li>
              <li><Link to="/categories" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">Categories</Link></li>
              <li><Link to="/dashboard" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">Dashboard</Link></li>
              <li><Link to="/register" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Resources</h4>
            <ul className="mt-4 space-y-2.5">
              <li><a href="#" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">How it works</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">Bid Guidelines</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">Help Center</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">API Documentation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Contact</h4>
            <ul className="mt-4 space-y-2.5">
               <li className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Mail size={14} /> support@tenderpulse.app</li>
              <li className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Phone size={14} /> +91 80 4567 8900</li>
              <li className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><MapPin size={14} /> Bengaluru, India</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Open-source tender discovery platform.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">Privacy Policy</a>
            <a href="#" className="text-xs text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">Terms of Service</a>
            <a href="#" className="text-xs text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">Security</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
