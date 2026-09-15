import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  User, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  CheckCircle2,
  HelpCircle, 
  Sparkles,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function AskDoubtModal({ 
  isOpen, 
  onClose, 
  student, 
  material, 
  facultyList = [],
  onOpenMyDoubts
}) {
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [topic, setTopic] = useState('');
  const [questionRef, setQuestionRef] = useState('');
  const [doubtText, setDoubtText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedDoubt, setSubmittedDoubt] = useState(null);

  // Initialize or update fields when material or modal changes
  useEffect(() => {
    if (material) {
      setSelectedSubject(material.subject);
      setTopic(material.title);
      setQuestionRef(material.title);

      // Find faculty for this material if available
      const matchingFaculty = facultyList.find(
        f => f.id === material.facultyId || f.name.toLowerCase() === (material.facultyName || '').toLowerCase()
      );
      if (matchingFaculty) {
        setSelectedFacultyId(matchingFaculty.id);
      } else {
        // Find any faculty teaching this subject
        const subjectFac = facultyList.find(
          f => f.subject.toLowerCase() === material.subject.toLowerCase()
        );
        if (subjectFac) setSelectedFacultyId(subjectFac.id);
      }
    } else {
      // Default to first faculty of selected subject
      const subjectFac = facultyList.find(
        f => f.subject.toLowerCase() === selectedSubject.toLowerCase()
      );
      if (subjectFac) {
        setSelectedFacultyId(subjectFac.id);
      } else if (facultyList.length > 0) {
        setSelectedFacultyId(facultyList[0].id);
      }
    }
  }, [material, facultyList, isOpen]);

  // Reset submission state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setErrorMsg('');
    }
  }, [isOpen]);

  // When subject changes, pick corresponding faculty
  const handleSubjectChange = (newSubject) => {
    setSelectedSubject(newSubject);
    const fac = facultyList.find(f => f.subject.toLowerCase() === newSubject.toLowerCase());
    if (fac) {
      setSelectedFacultyId(fac.id);
    }
  };

  if (!isOpen) return null;

  // Selected faculty details
  const activeFaculty = facultyList.find(f => f.id === selectedFacultyId) || facultyList[0];

  const handleSubmitDoubt = async (e) => {
    if (e) e.preventDefault();
    if (!doubtText.trim()) {
      setErrorMsg('Please describe your doubt or question clearly before submitting.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        studentId: student ? student.id : 'GUEST',
        studentName: student ? student.name : 'Guest Student',
        classBatch: student ? (student.classBatch || student.stream || 'Class 11/12') : 'General',
        facultyId: activeFaculty ? activeFaculty.id : 'FAC01',
        facultyName: activeFaculty ? activeFaculty.name : 'Faculty Member',
        subject: selectedSubject,
        topic: topic || (material ? material.title : 'General Concept'),
        questionRef: questionRef || (material ? material.title : ''),
        question: doubtText.trim()
      };

      const res = await api.submitDoubt(payload);
      if (res.success) {
        setSubmittedDoubt(res.doubt);
        setIsSubmitted(true);
      } else {
        setErrorMsg(res.message || 'Failed to submit doubt. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Could not submit doubt: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setIsSubmitted(false);
    setDoubtText('');
    setQuestionRef('');
    setErrorMsg('');
  };

  // Filter faculty for selected subject or show all
  const filteredFaculty = facultyList.filter(
    f => f.subject.toLowerCase() === selectedSubject.toLowerCase()
  );
  const displayFacultyList = filteredFaculty.length > 0 ? filteredFaculty : facultyList;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Ask Doubt Directly to Faculty</h3>
              <p className="text-xs text-blue-200 flex items-center gap-1.5">
                <span>Direct In-Portal Resolution</span>
                <span>•</span>
                <span>West Marredpally Faculty Team</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {isSubmitted ? (
            /* SUCCESS CONFIRMATION SCREEN */
            <div className="py-6 px-4 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md ring-8 ring-emerald-50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 uppercase tracking-wider mb-2">
                  Doubt Forwarded to Faculty
                </span>
                <h4 className="text-xl font-black text-slate-900">
                  Your Doubt Has Been Submitted!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                  Teacher <strong className="text-slate-900">{submittedDoubt?.facultyName}</strong> has received your question in their Faculty Portal. Once answered, the teacher's solution will appear directly in your dashboard.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 max-w-lg mx-auto">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Subject & Teacher:</span>
                  <span className="font-bold text-slate-800">{submittedDoubt?.subject} • {submittedDoubt?.facultyName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Topic / Reference:</span>
                  <span className="font-bold text-blue-700">{submittedDoubt?.topic || 'General Concept'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block mb-1">Your Question:</span>
                  <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 italic line-clamp-3">
                    "{submittedDoubt?.question}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                {student && onOpenMyDoubts && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenMyDoubts();
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>View In "My Doubts & Answers"</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetForAnother}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                >
                  Ask Another Question
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-3 text-slate-500 hover:text-slate-700 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* SUBMISSION FORM */
            <>
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Student Status Bar */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-900 text-white font-bold flex items-center justify-center">
                    {student ? student.name[0] : 'S'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {student ? student.name : 'Guest Student'}
                    </p>
                    <p className="text-blue-700 font-mono text-[11px]">
                      ID: {student ? student.id : 'Not Logged In'} • {student ? student.classBatch : 'General'}
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-block px-2.5 py-1 bg-white text-blue-800 rounded-lg font-semibold border border-blue-200">
                  {student ? 'Verified Student' : 'Guest Mode'}
                </span>
              </div>

              {/* Subject & Faculty Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Subject Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Select Subject *
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-700 focus:outline-none"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                  </select>
                </div>

                {/* Faculty Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Select Faculty Member *
                  </label>
                  <select
                    value={selectedFacultyId}
                    onChange={(e) => setSelectedFacultyId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-700 focus:outline-none"
                  >
                    {displayFacultyList.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.subject})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Faculty Details Card */}
              {activeFaculty && (
                <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {activeFaculty.name.trim()[0] || 'F'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{activeFaculty.name}</h4>
                      <p className="text-slate-600 text-[11px]">{activeFaculty.designation || activeFaculty.department || 'Senior Faculty'}</p>
                      <p className="text-indigo-700 font-medium text-[11px] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        Doubt Resolution Hours: {activeFaculty.availableHours || '4:00 PM - 8:00 PM'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white px-2.5 py-1 rounded-lg text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      In-Portal Inbox
                    </span>
                  </div>
                </div>
              )}

              {/* Reference & Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Topic / Chapter
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Definite Integrals, Rotational Motion"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Question No. / Worksheet Ref
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Worksheet 3 - Q.14 or DPP Problem 6"
                    value={questionRef}
                    onChange={(e) => setQuestionRef(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Doubt Details textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Describe Your Doubt Clearly *
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain where you are stuck, which step is causing confusion, or ask for the formula / shortcut..."
                  value={doubtText}
                  onChange={(e) => setDoubtText(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-blue-700 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* In-Portal Feature Guarantee */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">Direct In-Portal Resolution:</strong> No WhatsApp required. Your question is delivered to your faculty member's portal dashboard. Once resolved, the step-by-step answer appears directly in your logged-in dashboard.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!isSubmitted && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmitDoubt}
              disabled={submitting || !doubtText.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting Doubt...' : 'Submit Doubt to Faculty'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
