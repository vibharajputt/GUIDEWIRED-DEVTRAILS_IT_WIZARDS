import os
import re

FILES = [
    "frontend/RahatPay-app/src/pages/Admin.jsx",
    "frontend/RahatPay-app/src/pages/RiskMap.jsx"
]

REPLACEMENTS = [
    (r'bg-gray-50', r'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-200'),
    (r'bg-white\s+shadow-sm\s+border-b\s+px-4\s+py-4', r'glass-panel shadow-sm border-b border-white/5 px-4 py-4 sticky top-0 z-50 backdrop-blur-xl'),
    (r'text-gray-800', r'text-white'),
    (r'text-gray-500', r'text-slate-400'),
    (r'text-gray-600', r'text-slate-300'),
    (r'bg-blue-100\s+text-blue-700', r'bg-brand-500/20 text-brand-300 border border-brand-500/30'),
    (r'bg-blue-200', r'bg-brand-500/40'),
    (r'bg-gray-200', r'glass-super border border-white/5'),
    (r'bg-white\s+text-blue-700\s+shadow', r'bg-brand-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] border-brand-500 border'),
    (r'bg-white\s+p-5\s+rounded-xl\s+shadow', r'glass-panel p-5 rounded-3xl border border-white/5 hover:border-brand-500/20 transition-all shadow-lg'),
    (r'bg-white\s+p-6\s+rounded-2xl\s+shadow-lg', r'glass-panel p-6 rounded-3xl shadow-xl border border-white/5'),
    (r'bg-white\s+p-4\s+rounded-xl\s+shadow', r'glass-panel p-4 rounded-3xl border border-white/5 shadow-md'),
    (r'bg-white', r'glass-panel border-white/5 border'),
    (r'bg-green-50\s+border-2\s+border-green-200', r'glass-panel border-2 border-emerald-500/30 bg-emerald-900/20'),
    (r'bg-green-50\s+p-', r'glass-panel border border-emerald-500/20 bg-emerald-900/20 p-'),
    (r'bg-green-50', r'bg-emerald-900/20 border border-emerald-500/20'),
    (r'text-green-600', r'text-emerald-400'),
    (r'text-green-700', r'text-emerald-300'),
    (r'text-green-500', r'text-emerald-400'),
    (r'bg-red-50\s+border-2\s+border-red-200', r'glass-panel border-2 border-red-500/30 bg-red-900/20'),
    (r'bg-red-50\s+p-', r'glass-panel border border-red-500/20 bg-red-900/20 p-'),
    (r'bg-red-50', r'bg-red-900/20 border border-red-500/20'),
    (r'text-red-600', r'text-red-400'),
    (r'text-red-700', r'text-red-300'),
    (r'bg-blue-50\s+border-2\s+border-blue-200', r'glass-panel border-2 border-blue-500/30 bg-blue-900/20'),
    (r'bg-blue-50\s+p-', r'glass-panel border border-blue-500/20 bg-blue-900/20 p-'),
    (r'bg-blue-50', r'bg-blue-900/20 border border-blue-500/20'),
    (r'text-blue-600', r'text-brand-400'),
    (r'text-blue-700', r'text-brand-300'),
    (r'bg-yellow-50\s+border-2\s+border-yellow-200', r'glass-panel border-2 border-yellow-500/30 bg-yellow-900/20'),
    (r'bg-yellow-50\s+p-', r'glass-panel border border-yellow-500/20 bg-yellow-900/20 p-'),
    (r'bg-yellow-50', r'bg-yellow-900/20 border border-yellow-500/20'),
    (r'text-yellow-600', r'text-yellow-400'),
    (r'text-yellow-700', r'text-yellow-300'),
    (r'text-yellow-800', r'text-yellow-200'),
    (r'bg-orange-50', r'bg-orange-900/20 border border-orange-500/20'),
    (r'text-orange-600', r'text-orange-400'),
    (r'text-orange-700', r'text-orange-300'),
    (r'text-gray-400', r'text-slate-500'),
    (r'text-gray-700', r'text-slate-200'),
    (r'bg-gray-100', r'bg-slate-800/80'),
    (r'hover:bg-gray-50', r'hover:bg-white/5'),
    (r'border-b', r'border-b border-white/5'),
    (r'bg-red-100', r'bg-red-500/20'),
    (r'bg-green-100', r'bg-emerald-500/20'),
    (r'bg-yellow-100', r'bg-yellow-500/20'),
    (r'bg-orange-100', r'bg-orange-500/20'),
    (r'bg-blue-100', r'bg-brand-500/20'),
    (r'<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />', r'<CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />'),
]

for file_path in FILES:
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        for pattern, replacement in REPLACEMENTS:
            content = re.sub(pattern, replacement, content)
            
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Refactored {file_path}")
    else:
        print(f"File not found: {file_path}")
