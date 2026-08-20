import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { Heart, Menu, X, LogOut, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Heart className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">LifeDrop</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Home</Link>
            <Link to="/schedule" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Schedule</Link>
            <Link to="/learn" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Learn</Link>
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="flex items-center gap-2">
                <LogIn className="h-4 w-4" /> Sign In
              </Button>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 bg-white">
          <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary">Home</Link>
          <Link to="/schedule" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary">Schedule</Link>
          <Link to="/learn" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary">Learn</Link>
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">Sign Out</Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => { navigate('/auth'); setIsMenuOpen(false) }} className="w-full justify-start">Sign In</Button>
          )}
        </div>
      )}
    </nav>
  )
}
export default Navbar
