import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Home, UserPlus, LayoutDashboard, Map as MapIcon, Settings } from 'lucide-react';

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Register', path: '/onboarding', icon: <UserPlus size={18} /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Risk Map', path: '/risk-map', icon: <MapIcon size={18} /> },
    { name: 'Admin', path: '/admin', icon: <Settings size={18} /> },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className={`glass-super rounded-full flex justify-between items-center px-6 py-3 border border-white/10 ${scrolled ? 'shadow-[0_8px_32px_rgba(0,0,0,0.4)]' : 'shadow-none'}`}>
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-tr from-brand-600 to-brand-300 p-2 rounded-xl"
            >
              <ShieldAlert size={24} className="text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 tracking-tight">
              RahatPay<span className="text-brand-400">.</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors group"
                >
                  <span className={`relative z-10 flex items-center space-x-2 ${active ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                    {link.icon} <span>{link.name}</span>
                  </span>
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/10 rounded-full border border-white/20"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
