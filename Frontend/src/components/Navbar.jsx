import { Link, useLocation } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/catalogue', label: 'Catalogue' },
    { path: '/booking', label: 'Booking' },
    { path: '/register', label: 'Signup' },
    { path: '/login', label: 'Login' },
  ];

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
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 no-underline relative group ${
                isActive ? 'text-[#4F8CFF]' : 'text-[#cbd5e1] hover:text-white'
              }`}
            >
              {link.label}
              <span 
                className={`absolute bottom-1 left-4 right-4 h-0.5 bg-[#4F8CFF] transform transition-transform duration-300 ${
                  isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} 
              />
            </Link>
          );
        })}
      </div>
    </nav>
  )
}
