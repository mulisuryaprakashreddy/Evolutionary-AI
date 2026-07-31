import { ArrowRight, Github, Instagram, Twitter } from 'lucide-react';
import { useStore } from '../store';
import { CATEGORIES } from '../data';
import { CategoryIcon } from './CategoryIcon';

export function Footer() {
  const { navigate } = useStore();
  return (
    <footer className="mt-20 border-t border-app/10 bg-bg-elev">
      <div className="mx-auto max-w-8xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
                <ArrowRight size={18} className="rotate-90" />
              </span>
              <span className="font-display text-lg font-extrabold text-app">RentHub</span>
            </div>
             <p className="mt-4 max-w-sm text-sm leading-relaxed text-app-soft">
               The global marketplace for renting instead of buying. Rent almost anything from people and businesses near you — by the day, week, or month.
             </p>
            <div className="mt-6 flex gap-3">
              {[Twitter, Instagram, Github].map((Icon, i) => (
                <a key={i} href="#" className="grid h-10 w-10 place-items-center rounded-xl border border-app/15 text-app-soft transition-colors hover:border-primary hover:text-primary">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold text-app">Categories</h4>
            <ul className="mt-4 space-y-2.5">
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <button onClick={() => navigate({ name: 'browse', category: c.id })} className="inline-flex items-center gap-2 text-sm text-app-soft transition-colors hover:text-app">
                    <CategoryIcon name={c.icon} className="h-3.5 w-3.5" /> {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold text-app">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-app-soft">
              <li><a href="#" className="transition-colors hover:text-app">About us</a></li>
              <li><a href="#" className="transition-colors hover:text-app">How it works</a></li>
              <li><a href="#" className="transition-colors hover:text-app">Become a lender</a></li>
              <li><a href="#" className="transition-colors hover:text-app">Careers</a></li>
              <li><a href="#" className="transition-colors hover:text-app">Press</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold text-app">Support</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-app-soft">
              <li><a href="#" className="transition-colors hover:text-app">Help center</a></li>
              <li><a href="#" className="transition-colors hover:text-app">Trust & safety</a></li>
              <li><a href="#" className="transition-colors hover:text-app">Insurance</a></li>
              <li><a href="#" className="transition-colors hover:text-app">Cancellations</a></li>
              <li><a href="#" className="transition-colors hover:text-app">Contact us</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-app/10 pt-6 sm:flex-row">
          <p className="text-xs text-app-faint">© {new Date().getFullYear()} RentHub. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-app-faint">
            <a href="#" className="transition-colors hover:text-app">Privacy</a>
            <a href="#" className="transition-colors hover:text-app">Terms</a>
            <a href="#" className="transition-colors hover:text-app">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
