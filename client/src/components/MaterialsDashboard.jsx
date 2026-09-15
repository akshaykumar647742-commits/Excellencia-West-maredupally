import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  FileSpreadsheet, 
  Sparkles, 
  Calculator, 
  Atom, 
  FlaskConical, 
  Dna, 
  BookText, 
  Layers, 
  DownloadCloud, 
  CheckCircle2, 
  MessageCircleQuestion, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import MaterialCard from './MaterialCard';
import { Lock, GraduationCap } from 'lucide-react';

export default function MaterialsDashboard({ 
  materials = [], 
  loading, 
  student, 
  facultyAuth = null,
  isAuthenticated = false,
  onOpenDoubtModal, 
  onPreviewMaterial, 
  onRequireLogin,
  onRefresh,
  onGoToStudentLogin
}) {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Subject configurations with icons and themes
  const subjects = [
    { id: 'All', name: 'All Subjects', icon: Layers, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300' },
    { id: 'Mathematics', name: 'Mathematics', icon: Calculator, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    { id: 'Physics', name: 'Physics', icon: Atom, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
    { id: 'Chemistry', name: 'Chemistry', icon: FlaskConical, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { id: 'Biology', name: 'Biology', icon: Dna, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
    { id: 'English', name: 'English', icon: BookText, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  ];

  // Category filters
  const categories = [
    'All',
    'Worksheet',
    'Daily Practice Problems (DPP)',
    'Lecture Notes',
    'Formula Sheet',
    'Previous Year Papers'
  ];

  // Batches
  const batches = [
    'All',
    'Class 11',
    'Class 12',
    'JEE',
    'NEET',
    'IPE'
  ];

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      // Subject filter
      if (selectedSubject !== 'All' && m.subject.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'All' && m.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Batch filter
      if (selectedBatch !== 'All' && !m.classBatch.toLowerCase().includes(selectedBatch.toLowerCase())) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = m.title.toLowerCase().includes(q);
        const inDesc = (m.description || '').toLowerCase().includes(q);
        const inFaculty = m.facultyName.toLowerCase().includes(q);
        const inSubject = m.subject.toLowerCase().includes(q);
        const inTags = m.tags && m.tags.some(t => t.toLowerCase().includes(q));
        if (!inTitle && !inDesc && !inFaculty && !inSubject && !inTags) return false;
      }
      return true;
    });
  }, [materials, selectedSubject, selectedCategory, selectedBatch, searchQuery]);

  // Counts by subject
  const subjectCounts = useMemo(() => {
    const counts = { All: materials.length };
    materials.forEach(m => {
      counts[m.subject] = (counts[m.subject] || 0) + 1;
    });
    return counts;
  }, [materials]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-blue-900/50">
        {/* Background decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-40 -top-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700/50 text-blue-200 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>West Marredpally Campus • Digital Repository</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {student ? (
                <>Welcome back, <span className="text-amber-400">{student.name}</span>!</>
              ) : (
                <>Excellencia Student Learning Hub</>
              )}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              {student ? (
                <>Enrolled in <strong className="text-white">{student.classBatch}</strong> ({student.stream}). All chapter worksheets, DPPs, and formula sheets are organized below. Click any worksheet to practice or ask doubts directly to faculty in your dashboard.</>
              ) : (
                <>Access worksheets, daily practice problems (DPP), lecture notes, and formula sheets across all subjects at one glance. Have a doubt? Ask faculty directly and receive step-by-step solutions right here in your dashboard.</>
              )}
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex sm:flex-col gap-3 flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">
                {materials.length}
              </div>
              <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Worksheets & Notes
              </div>
            </div>

            <button
              onClick={() => onOpenDoubtModal()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <MessageCircleQuestion className="w-4 h-4" />
              <span>Ask Doubt to Faculty</span>
            </button>
          </div>
        </div>
      </div>

      {/* "At a Glance" Subject Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-700" />
            <span>Select Subject (At a Glance)</span>
          </h3>
          <button 
            onClick={onRefresh} 
            className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1 font-semibold"
            title="Refresh list"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {subjects.map(sub => {
            const Icon = sub.icon;
            const isSelected = selectedSubject.toLowerCase() === sub.id.toLowerCase();
            const count = subjectCounts[sub.id] || 0;

            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-900 text-white border-blue-900 shadow-md scale-102 ring-2 ring-blue-700/50'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-white/20 text-white' : `${sub.bg} ${sub.color}`
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-amber-400 text-blue-950' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </div>
                <span className="font-bold text-xs sm:text-sm tracking-tight truncate">
                  {sub.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Pills & Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search worksheets, topics, DPPs, chapters, faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Batch Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">
              Target Batch:
            </span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            >
              {batches.map(b => (
                <option key={b} value={b}>
                  {b === 'All' ? 'All Batches / Classes' : b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-blue-600" />
            Type:
          </span>
          {categories.map(cat => {
            const active = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Materials Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-lg text-slate-900">
              {selectedSubject === 'All' ? 'All Academic Materials' : `${selectedSubject} Worksheets & Materials`}
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {filteredMaterials.length} Available
            </span>
          </div>

          {(selectedSubject !== 'All' || selectedCategory !== 'All' || selectedBatch !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedSubject('All');
                setSelectedCategory('All');
                setSelectedBatch('All');
                setSearchQuery('');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Unauthenticated Security Notice Banner */}
        {!isAuthenticated && (
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-200/60 border border-amber-300 flex items-center justify-center text-amber-800 flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-amber-950 block sm:inline">Protected Academic Repository: </span>
                <span className="text-amber-800">Please log in with your Student ID or Faculty account to preview and download worksheets.</span>
              </div>
            </div>
            <button
              onClick={() => onGoToStudentLogin && onGoToStudentLogin()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex-shrink-0"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>Student Login</span>
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-500">Loading worksheets and materials...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-800">No materials matched your filters</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try searching for a different keyword or switch subject/category tabs. Faculty can upload new materials via the Faculty Portal.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedSubject('All');
                setSelectedCategory('All');
                setSelectedBatch('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800"
            >
              View All Worksheets
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMaterials.map(material => (
              <MaterialCard
                key={material.id}
                material={material}
                isAuthenticated={isAuthenticated}
                student={student}
                facultyAuth={facultyAuth}
                onRequireLogin={onRequireLogin}
                onOpenDoubtModal={onOpenDoubtModal}
                onPreview={onPreviewMaterial}
              />
            ))}
          </div>
        )}
      </div>

      {/* Doubt Clearing WhatsApp Explainer Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md text-emerald-50">
            Student Doubt Clearing Facility
          </span>
          <h4 className="text-xl sm:text-2xl font-black">
            Stuck on a problem or formula?
          </h4>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Click on <strong>"Ask Doubt on this Worksheet"</strong> on any card, or use the top button. Your question is automatically pre-formatted with your Student ID, Name, Subject, and Worksheet name, and opens directly in the faculty member's WhatsApp chat.
          </p>
        </div>

        <button
          onClick={() => onOpenDoubtModal()}
          className="flex-shrink-0 px-6 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          <MessageCircleQuestion className="w-4 h-4 text-emerald-600" />
          <span>Ask Doubt Now</span>
        </button>
      </div>
    </div>
  );
}
