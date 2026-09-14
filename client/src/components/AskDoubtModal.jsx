import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  User, 
  BookOpen, 
  Clock, 
  Phone, 
  CheckCircle, 
  HelpCircle, 
  Sparkles,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function AskDoubtModal({ 
  isOpen, 
  onClose, 
  student, 
  material, 
  facultyList = [] 
}) {
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [topic, setTopic] = useState('');
  const [questionRef, setQuestionRef] = useState('');
  const [doubtText, setDoubtText] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize or update fields when material or modal changes
  useEffect(() => {
    if (material) {
      setSelectedSubject(material.subject);
      setTopic(material.title);
      setQuestionRef(material.title);

      // Find faculty for this material if available
      const matchingFaculty = facultyList.find(
        f => f.id === material.facultyId || f.name.toLowerCase() === material.facultyName.toLowerCase()
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

  // Build the pre-formatted WhatsApp message
  const buildWhatsAppMessage = () => {
    const studentName = student ? student.name : 'Student';
    const studentId = student ? student.id : 'N/A';
    const classBatch = student ? (student.classBatch || student.stream || 'Class 11/12') : 'Class 11/12';
    const facName = activeFaculty ? activeFaculty.name : 'Sir/Madam';

    return `🎓 *EXCELLENCIA - STUDENT DOUBT CLEARING*
🏫 *Campus:* West Marredpally
────────────────────
👤 *Student:* ${studentName}
🆔 *Student ID:* ${studentId}
🏛️ *Class/Batch:* ${classBatch}
📚 *Subject:* ${selectedSubject}
👨‍🏫 *Faculty:* ${facName}
${topic ? `📖 *Topic:* ${topic}\n` : ''}${questionRef ? `📝 *Reference:* ${questionRef}\n` : ''}────────────────────
❓ *Doubt / Question:*
"${doubtText || 'Sir/Madam, I have a doubt in this concept. Please guide me.'}"
────────────────────
_Sent directly via Excellencia Academic Portal_`;
  };

  const handleSendWhatsApp = async () => {
    if (!doubtText.trim()) {
      alert('Please type your doubt or question first!');
      return;
    }

    if (!activeFaculty || !activeFaculty.phone) {
      alert('Faculty WhatsApp contact is not available.');
      return;
    }

    setSending(true);

    const message = buildWhatsAppMessage();

    // Log the doubt to backend for student & faculty history
    try {
      await api.logDoubt({
        studentId: student ? student.id : 'Anonymous',
        studentName: student ? student.name : 'Student',
        facultyId: activeFaculty.id,
        facultyName: activeFaculty.name,
        subject: selectedSubject,
        topic: topic || (material ? material.title : 'General Doubt'),
        question: doubtText
      });
    } catch (e) {
      console.warn('Doubt log error:', e);
    }

    // Clean phone number (ensure country code, default to 91 if 10 digits)
    let phoneNum = activeFaculty.phone.replace(/[^0-9]/g, '');
    if (phoneNum.length === 10) {
      phoneNum = '91' + phoneNum;
    }

    // Open WhatsApp URL
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setSending(false);
    onClose();
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(buildWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Ask Doubt Directly to Faculty</h3>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5">
                <span>Sends directly to faculty WhatsApp</span>
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
              Verified Student
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
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
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  {activeFaculty.name.split(' ').slice(-1)[0][0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{activeFaculty.name}</h4>
                  <p className="text-slate-600 text-[11px]">{activeFaculty.designation || activeFaculty.department}</p>
                  <p className="text-emerald-700 font-medium text-[11px] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    Available: {activeFaculty.availableHours || '4:00 PM - 8:00 PM'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-white px-2 py-1 rounded-md text-emerald-800 border border-emerald-200">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  +91 {activeFaculty.phone.slice(-10)}
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
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
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* WhatsApp Message Preview */}
          <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Live WhatsApp Message Preview
              </span>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold"
              >
                {copied ? '✓ Copied!' : 'Copy Text'}
              </button>
            </div>
            <pre className="whitespace-pre-wrap font-sans bg-white p-3 rounded-xl border border-slate-200 text-slate-800 text-[11px] leading-relaxed select-all">
              {buildWhatsAppMessage()}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
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
            onClick={handleSendWhatsApp}
            disabled={sending || !doubtText.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Send className="w-4 h-4" />
            <span>Open WhatsApp & Send to Faculty</span>
          </button>
        </div>
      </div>
    </div>
  );
}
