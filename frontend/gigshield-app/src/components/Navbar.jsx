import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🛡️</span>
            <span className="text-xl font-bold">GigShield</span>
          </Link>
          <div className="flex space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') ? 'bg-blue-900' : 'hover:bg-blue-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/onboarding"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/onboarding') ? 'bg-blue-900' : 'hover:bg-blue-600'
              }`}
            >
              Register
            </Link>
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/dashboard') ? 'bg-blue-900' : 'hover:bg-blue-600'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/risk-map"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/risk-map') ? 'bg-blue-900' : 'hover:bg-blue-600'
              }`}
            >
              Risk Map
            </Link>
            <Link
              to="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/admin') ? 'bg-blue-900' : 'hover:bg-blue-600'
              }`}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;