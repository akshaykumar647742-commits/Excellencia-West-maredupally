import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  MessageCircleQuestion, 
  UserCheck, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  PhoneCall
} from 'lucide-react';

export default function Navbar({ 
  student, 
  facultyAuth = null,
  onLogout, 
  onFacultyLogout,
  activeView, 
  setActiveView, 
  onOpenDoubtModal, 
  facultyCount 
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top institution bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium tracking-wide">EXCELLENCIA JUNIOR COLLEGE • WEST MARREDPALLY</span>
            <span className="hidden sm:inline text-blue-200">| Academic Portal 2026-27</span>
          </div>
          <div className="flex items-center gap-4 text-blue-200">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              Direct Faculty WhatsApp Doubts Available
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap justify-between items-center gap-4">
        {/* Brand */}
        <div 
          onClick={() => setActiveView('materials')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-amber-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-blue-900 rounded-[10px] flex items-center justify-center text-white">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                EXCELLENCIA
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                West Marredpally
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-blue-600" /> Study Materials & Worksheet Hub
            </p>
          </div>
        </div>

        {/* Action Buttons & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Ask Doubt Button (Always accessible) */}
          <button
            onClick={() => onOpenDoubtModal()}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
            title="Ask Doubt via Direct WhatsApp to Faculty"
          >
            <MessageCircleQuestion className="w-4 h-4 text-emerald-200" />
            <span>Ask Doubt on WhatsApp</span>
            <span className="hidden md:inline-block text-[11px] bg-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
              Instant
            </span>
          </button>

          {/* Switch to Faculty Portal */}
          <button
            onClick={() => setActiveView(activeView === 'faculty' ? 'materials' : 'faculty')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${
              activeView === 'faculty'
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Faculty</span>
            <span>{activeView === 'faculty' ? 'Student View' : 'Portal'}</span>
          </button>

          {/* Profile & Logout for Student or Faculty */}
          {student ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1 justify-end">
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  {student.name}
                </p>
                <p className="text-[11px] text-blue-600 font-mono font-bold">
                  ID: {student.id}
                </p>
              </div>
              <div 
                className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 text-blue-800 font-bold flex items-center justify-center text-xs shadow-xs"
                title={`${student.name} (${student.id})`}
              >
                {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Logout Student ID"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : facultyAuth ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-bold text-amber-900 leading-tight flex items-center gap-1 justify-end">
                  <ShieldCheck className="w-3 h-3 text-amber-600" />
                  {facultyAuth.name}
                </p>
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                  {facultyAuth.subject || 'Faculty'}
                </p>
              </div>
              <div 
                className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-bold flex items-center justify-center text-xs shadow-xs"
                title={`${facultyAuth.name} (${facultyAuth.subject || 'Faculty'})`}
              >
                {facultyAuth.name.replace('Prof.', '').replace('Dr.', '').trim()[0] || 'F'}
              </div>
              <button
                onClick={onFacultyLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Logout Faculty Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveView('login')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              <span>Student Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
