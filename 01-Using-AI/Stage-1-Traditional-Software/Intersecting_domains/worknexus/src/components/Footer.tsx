import { Briefcase, Globe, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">WorkNexus</span>
            </Link>
            <p className="text-sm text-neutral-500 max-w-xs">
              The marketplace where talent meets opportunity. Hire skilled freelancers or find your next gig.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="h-9 w-9 rounded-lg flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                <Globe className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                <Mail className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">For Clients</h4>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li><Link to="/projects/new" className="hover:text-primary-600">Post a Project</Link></li>
              <li><Link to="/freelancers" className="hover:text-primary-600">Find Freelancers</Link></li>
              <li><Link to="/projects" className="hover:text-primary-600">Browse Projects</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">For Freelancers</h4>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li><Link to="/signup" className="hover:text-primary-600">Become a Freelancer</Link></li>
              <li><Link to="/projects" className="hover:text-primary-600">Find Work</Link></li>
              <li><Link to="/profile" className="hover:text-primary-600">Build Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li><a href="#" className="hover:text-primary-600">About</a></li>
              <li><a href="#" className="hover:text-primary-600">Privacy</a></li>
              <li><a href="#" className="hover:text-primary-600">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">Open-source freelancing marketplace.</p>
        </div>
      </div>
    </footer>
  );
}
