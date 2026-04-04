import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import RiskMap from './pages/RiskMap';
import CommandPalette from './components/CommandPalette';
import { I18nProvider } from './components/I18nProvider';

function App() {
  return (
    <I18nProvider>
      <Router>
        <CommandPalette />
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 pt-24 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/risk-map" element={<RiskMap />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </Router>
    </I18nProvider>
  );
}

export default App;
