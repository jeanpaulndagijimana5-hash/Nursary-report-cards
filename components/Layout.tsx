
import React from 'react';
import { User, UserRole } from '../types';
import { Button } from './Button';
import { getSchoolConfig } from '../services/storageService';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  title: string;
  onOpenProfile: () => void;
  logoUrl?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, title, onOpenProfile, logoUrl }) => {
  const schoolConfig = getSchoolConfig();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-indigo-50/50">
      {/* Sidebar */}
      <aside className="bg-white border-b md:border-b-0 md:border-r border-indigo-100 w-full md:w-80 flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 z-20 print:hidden transition-all duration-300">
        <div className="p-8 border-b border-indigo-50 flex flex-row md:flex-col items-center justify-between md:justify-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-white rounded-2xl shadow-xl shadow-indigo-100 p-1 border border-indigo-50">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-200">
                  NC
                </div>
              )}
            </div>
            <div className="md:hidden lg:block">
              <span className="font-black text-2xl text-indigo-900 leading-tight block">Nursery</span>
              <span className="font-bold text-indigo-400 text-sm tracking-widest uppercase">Portal</span>
            </div>
          </div>
          
          <div className="md:text-center space-y-1">
            <div className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Logged as</div>
            <div className="font-black text-slate-800 text-lg leading-tight">{user?.name}</div>
            <div className="text-[10px] font-black text-white bg-indigo-600 px-3 py-1 rounded-full inline-block uppercase tracking-wider shadow-lg shadow-indigo-100">
               {user?.role}
            </div>
          </div>
        </div>

        <nav className="p-6 flex-grow space-y-8">
           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">Navigation</h4>
              <div className="space-y-1">
                 <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold transition-all shadow-sm border border-indigo-100/50">
                    <span className="text-xl">🏠</span>
                    <span>Dashboard</span>
                 </div>
              </div>
           </div>

           {(schoolConfig.motto) && (
             <div className="p-4 bg-yellow-50 rounded-[2rem] border-2 border-yellow-100 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 text-4xl opacity-10 group-hover:scale-125 transition-transform">🎓</div>
                <h5 className="font-black text-yellow-800 text-xs uppercase mb-2">School Motto</h5>
                <p className="text-[11px] font-bold text-yellow-700 italic leading-relaxed">
                  "{schoolConfig.motto}"
                </p>
             </div>
           )}
        </nav>

        <div className="p-6 border-t border-indigo-50 space-y-3 bg-slate-50/50">
          <Button variant="ghost" onClick={onOpenProfile} className="w-full justify-start text-slate-600 hover:bg-white hover:shadow-sm rounded-2xl py-3 border-2 border-transparent hover:border-indigo-100 transition-all">
             <span className="text-xl">⚙️</span>
             <span className="font-bold">Settings</span>
          </Button>
          <Button variant="ghost" onClick={onLogout} className="w-full justify-start text-red-400 hover:bg-red-50 hover:text-red-600 rounded-2xl py-3 transition-all">
             <span className="text-xl">🚪</span>
             <span className="font-bold">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-12 overflow-y-auto relative">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-indigo-900 tracking-tight">{title}</h1>
            <p className="text-slate-400 font-medium mt-1">Nursery Management Dashboard &bull; {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          {user?.role === UserRole.TEACHER && (
             <div className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100">
               Live Grading Mode
             </div>
          )}
        </header>
        
        <div className="max-w-6xl mx-auto">
          {children}
        </div>

        <footer className="mt-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest pb-10 print:hidden opacity-50">
          &bull; Nursery Report Card Generator &bull;
        </footer>
      </main>
    </div>
  );
};
