import { Heart } from "lucide-react"
import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">LifeDrop</span>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Connecting donors with those in need. Your donation can save up to three lives.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/learn" className="text-gray-400 hover:text-white">Blood Donation FAQ</Link></li>
              <li><Link to="/learn" className="text-gray-400 hover:text-white">Eligibility Requirements</Link></li>
              <li><Link to="/learn" className="text-gray-400 hover:text-white">Donation Process</Link></li>
              <li><Link to="/learn" className="text-gray-400 hover:text-white">Blood Types Guide</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Connect</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Facebook</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Twitter</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Instagram</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} LifeDrop. A community project — no payments, no fees.</p>
        </div>
      </div>
    </footer>
  )
}
export default Footer
