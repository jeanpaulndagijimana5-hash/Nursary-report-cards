import React from 'react';
import { User, UserRole } from '../types';
import { Button } from './Button';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  title: string;
  onOpenProfile: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, title, onOpenProfile }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-indigo-50/50">
      {/* Sidebar / Topbar */}
      <aside className="bg-white border-b md:border-b-0 md:border-r border-indigo-100 w-full md:w-64 flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 z-20 print:hidden">
        <div className="p-6 border-b border-indigo-50 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
              NC
            </div>
            <span className="font-bold text-xl text-indigo-900 leading-tight block md:hidden lg:block">Nursery<br/>Cards</span>
          </div>
          <div className="md:text-center">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Welcome</div>
            <div className="font-semibold text-slate-700">{user?.name}</div>
            <div className="text-xs text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full inline-block mt-1">{user?.role}</div>
          </div>
        </div>

        <div className="p-4 flex-grow">
          {/* Navigation Items could go here */}
          <div className="text-sm text-slate-400 p-2 italic">
            {user?.role === UserRole.TEACHER ? 'Select Class & Subject to Enter Marks' : 'Select Student to Print Report'}
          </div>
        </div>

        <div className="p-4 border-t border-indigo-50 space-y-2">
          <Button variant="ghost" onClick={onOpenProfile} className="w-full justify-start text-slate-600 hover:bg-slate-50">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             Profile Settings
          </Button>
          <Button variant="ghost" onClick={onLogout} className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center print:hidden">
          <h1 className="text-2xl md:text-3xl font-bold text-indigo-900">{title}</h1>
        </header>
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
