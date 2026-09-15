import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  User, 
  BookOpen, 
  Sparkles, 
  Send, 
  HelpCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function StudentDoubtsModal({ 
  isOpen, 
  onClose, 
  student, 
  onOpenAskDoubt 
}) {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'answered' | 'pending'
  const [refreshing, setRefreshing] = useState(false);

  const fetchStudentDoubts = async () => {
    if (!student?.id) return;
    try {
      setRefreshing(true);
      const data = await api.getDoubts({ studentId: student.id });
      setDoubts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load student doubts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen && student?.id) {
      setLoading(true);
      fetchStudentDoubts();
    }
  }, [isOpen, student?.id]);

  if (!isOpen) return null;

  const answeredCount = doubts.filter(d => d.status === 'answered').length;
  const pendingCount = doubts.filter(d => (d.status || 'pending') === 'pending').length;

  const filteredDoubts = doubts.filter(d => {
    if (activeFilter === 'answered') return d.status === 'answered';
    if (activeFilter === 'pending') return (d.status || 'pending') === 'pending';
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">My Academic Doubts & Answers</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-800 text-blue-200 text-[10px] font-mono font-bold">
                  {student?.id || 'Student'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Direct faculty explanations and guidance saved permanently to your dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStudentDoubts}
              disabled={refreshing}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Refresh doubts"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar & Quick Stats */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeFilter === 'all' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({doubts.length})
            </button>
            <button
              onClick={() => setActiveFilter('answered')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeFilter === 'answered' 
                  ? 'bg-emerald-600 text-white shadow-2xs' 
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Answered ({answeredCount})</span>
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeFilter === 'pending' 
                  ? 'bg-amber-500 text-white shadow-2xs' 
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Review ({pendingCount})</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onOpenAskDoubt) onOpenAskDoubt(null);
            }}
            className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>Ask New Doubt</span>
          </button>
        </div>

        {/* Doubts List Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
              <p className="text-xs font-semibold">Loading your questions & solutions...</p>
            </div>
          ) : filteredDoubts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-3 max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {activeFilter === 'answered'
                  ? 'No answered doubts yet'
                  : activeFilter === 'pending'
                  ? 'No pending questions under review'
                  : 'You haven\'t asked any doubts yet!'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Whenever you encounter difficult problems or confusing steps, submit a doubt directly to your faculty here.
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenAskDoubt) onOpenAskDoubt(null);
                }}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Ask a Doubt Now
              </button>
            </div>
          ) : (
            filteredDoubts.map(d => {
              const isAnswered = d.status === 'answered';
              return (
                <div 
                  key={d.id} 
                  className={`p-5 rounded-2xl border transition-all ${
                    isAnswered 
                      ? 'bg-white border-emerald-200 shadow-xs hover:border-emerald-300' 
                      : 'bg-white border-amber-200 shadow-xs'
                  }`}
                >
                  {/* Top Bar: Subject, Topic, Status Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {d.subject}
                      </span>
                      {d.topic && (
                        <span className="text-xs font-bold text-slate-800">
                          {d.topic}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatDate(d.timestamp)}
                      </span>
                      {isAnswered ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Answered</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[11px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Under Review</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Student's Question */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Your Question:
                    </p>
                    <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap font-medium">
                      "{d.question}"
                    </p>
                  </div>

                  {/* Faculty Response Box */}
                  {isAnswered ? (
                    <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/50 p-4 rounded-xl border-2 border-emerald-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                            {d.answeredBy ? d.answeredBy[0] : 'T'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-emerald-950">
                              Faculty Solution by <span className="text-emerald-700 font-black">{d.answeredBy || d.facultyName}</span>
                            </p>
                            <p className="text-[10px] text-emerald-700">
                              Faculty - {d.subject} Department
                            </p>
                          </div>
                        </div>

                        {d.answeredAt && (
                          <span className="text-[10px] text-emerald-800 font-mono font-medium">
                            Answered {formatDate(d.answeredAt)}
                          </span>
                        )}
                      </div>

                      <div className="bg-white/90 p-3.5 rounded-xl border border-emerald-200 text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed shadow-2xs font-normal">
                        {d.answer}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>
                        Assigned to <strong>{d.facultyName || `${d.subject} Faculty`}</strong>. The answer will appear right here as soon as the teacher submits the solution.
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between flex-shrink-0 text-xs">
          <p className="text-slate-500 text-[11px]">
            Doubts are resolved directly by West Marredpally faculty members.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
