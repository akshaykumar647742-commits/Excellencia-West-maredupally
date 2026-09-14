import React, { useState } from 'react';
import { 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  BookOpen, 
  CheckCircle2, 
  UserPlus, 
  Users 
} from 'lucide-react';
import { api } from '../services/api';

export default function StudentLogin({ onLoginSuccess, onCancel }) {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  // New student registration state
  const [newStudent, setNewStudent] = useState({
    id: '',
    name: '',
    classBatch: 'Class 11 - JEE Batch A',
    stream: 'MPC (Maths, Physics, Chemistry)',
    phone: '',
    rollNo: ''
  });
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Sample student quick chips
  const sampleStudents = [
    { id: 'EXM101', name: 'Aarav Sharma', stream: 'Class 11 • MPC / JEE' },
    { id: 'EXM102', name: 'Ananya Reddy', stream: 'Class 12 • BiPC / NEET' },
    { id: 'EXM103', name: 'Sai Krishna', stream: 'Class 12 • JEE Adv' },
    { id: 'EXM104', name: 'Rhea Verghese', stream: 'Class 11 • IPE + NEET' }
  ];

  const handleLogin = async (idToUse) => {
    const id = (idToUse || studentId).trim().toUpperCase();
    if (!id) {
      setError('Please enter your Excellencia Student ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.loginStudent(id);
      if (res.success && res.student) {
        onLoginSuccess(res.student);
      } else {
        setError(res.message || 'Student ID not recognized');
      }
    } catch (err) {
      setError('Unable to connect to school server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!newStudent.id.trim() || !newStudent.name.trim()) {
      setError('Please enter both Student ID and Full Name');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.registerStudent({
        ...newStudent,
        id: newStudent.id.trim().toUpperCase()
      });
      if (res.success && res.student) {
        setRegisterSuccess(`Student ${res.student.name} registered successfully! Logging you in...`);
        setTimeout(() => {
          onLoginSuccess(res.student);
        }, 1200);
      } else {
        setError(res.message || 'Failed to register student');
      }
    } catch (err) {
      setError('Registration failed. Please verify server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-blue-900 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <GraduationCap className="w-9 h-9 text-amber-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Excellencia Student Portal
          </h2>
          <p className="text-xs uppercase tracking-widest font-bold text-amber-600 mt-1">
            West Marredpally Campus
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {showRegister 
              ? 'Enter your details to generate your student access' 
              : 'Login with your Student ID to access all worksheets, lecture notes, and faculty WhatsApp doubt clearing.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {registerSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-700 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
            <span>{registerSuccess}</span>
          </div>
        )}

        {!showRegister ? (
          <div>
            {/* Student ID Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Excellencia Student ID Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    placeholder="e.g. EXM101 or 2024-11-01"
                    className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-mono text-base font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors uppercase tracking-wider"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-900 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-70 text-sm"
              >
                <span>{loading ? 'Verifying ID...' : 'Access My Materials & Worksheets'}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </form>

            {/* Quick Demo Student Pills */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick-click demo students to test:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {sampleStudents.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setStudentId(s.id);
                      handleLogin(s.id);
                    }}
                    className="text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all text-xs group"
                  >
                    <div className="font-mono font-bold text-blue-900 group-hover:text-blue-700">
                      {s.id}
                    </div>
                    <div className="text-slate-800 font-semibold truncate">{s.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{s.stream}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Register New Student Toggle */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setError('');
                  setShowRegister(true);
                }}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                New student? Enroll / Add your Student ID
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Student ID / Roll No *
              </label>
              <input
                type="text"
                placeholder="e.g. EXM201"
                value={newStudent.id}
                onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-semibold uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Snehith Reddy"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Class / Batch
                </label>
                <select
                  value={newStudent.classBatch}
                  onChange={(e) => setNewStudent({ ...newStudent, classBatch: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Class 11 - JEE Batch A">Class 11 - JEE Batch A</option>
                  <option value="Class 11 - NEET Medical">Class 11 - NEET Medical</option>
                  <option value="Class 12 - JEE Advanced">Class 12 - JEE Advanced</option>
                  <option value="Class 12 - NEET Medical">Class 12 - NEET Medical</option>
                  <option value="Class 11 - IPE General">Class 11 - IPE General</option>
                  <option value="Class 12 - IPE General">Class 12 - IPE General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Stream
                </label>
                <select
                  value={newStudent.stream}
                  onChange={(e) => setNewStudent({ ...newStudent, stream: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="MPC (Maths, Physics, Chemistry)">MPC (Maths, Physics, Chemistry)</option>
                  <option value="BiPC (Biology, Physics, Chemistry)">BiPC (Biology, Physics, Chemistry)</option>
                  <option value="MEC / Commerce">MEC / Commerce</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Parent / Student WhatsApp Phone (Optional)
              </label>
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={newStudent.phone}
                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRegister(false);
                  setError('');
                }}
                className="w-1/3 py-2.5 px-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {loading ? 'Creating...' : 'Enroll & Sign In'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
