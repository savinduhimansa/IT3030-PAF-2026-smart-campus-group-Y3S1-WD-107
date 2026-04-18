import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 flex items-center justify-between transition-all duration-250 py-4 bg-surface-dark/85 backdrop-blur-2xl border-b border-border"
      id="home-navbar"
    >
      <Link to="/" className="flex items-center gap-3 no-underline text-text-primary">
        <div className="w-[42px] h-[42px] rounded-xl gradient-primary flex items-center justify-center shadow-glow">
          <Zap size={22} color="white" />
        </div>
        <h1 className="text-[22px] font-extrabold gradient-text">SpaceLink</h1>
      </Link>
      <div className="flex items-center gap-2">
        <Link to="/" className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-glass-hover transition-all duration-150 no-underline">
          Home
        </Link>
        <Link to="/about" className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-glass-hover transition-all duration-150 no-underline">
          About
        </Link>
        <Link to="/catalogue" className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-glass-hover transition-all duration-150 no-underline">
          Catalogue
        </Link>
        <Link to="/tickets/new" className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 no-underline flex items-center gap-1">
          Report Issue
        </Link>
        <Link to="/register" className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-glass-hover transition-all duration-150 no-underline">
          Signup
        </Link>
        <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-glass-hover transition-all duration-150 no-underline">
          Login
        </Link>

      </div>
    </nav>
  )
}
