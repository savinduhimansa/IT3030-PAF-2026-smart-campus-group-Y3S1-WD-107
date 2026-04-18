import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleAboutClick = () => {
    if (location.pathname === '/') {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    navigate('/')
    setTimeout(() => {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 flex items-center justify-between transition-all duration-300 py-4 bg-[#0a0e1a]/85 backdrop-blur-md border-b border-white/5"
      id="home-navbar"
    >
      <Link to="/" className="flex items-center gap-3 no-underline text-white">
        <div className="w-[42px] h-[42px] rounded-xl bg-blue-gradient flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Zap size={22} color="white" />
        </div>
        <h1 className="text-[22px] font-extrabold gradient-text">SpaceLink</h1>
      </Link>
      <div className="flex items-center gap-2">
        <Link to="/" className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all duration-150 no-underline">
          Home
        </Link>
        <button
          type="button"
          onClick={handleAboutClick}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all duration-150 bg-transparent border-none cursor-pointer"
        >
          About
        </button>
        <Link to="/catalogue" className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all duration-150 no-underline">
          Catalogue
        </Link>
        <Link to="/tickets/new" className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 no-underline flex items-center gap-1">
          Report Issue
        </Link>
        <Link to="/register" className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all duration-150 no-underline">
          Signup
        </Link>
        <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all duration-150 no-underline">
          Login
        </Link>

      </div>
    </nav>
  )
}
