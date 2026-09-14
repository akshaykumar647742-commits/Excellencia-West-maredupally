import React from 'react';
import { 
  Lock, 
  X, 
  GraduationCap, 
  ShieldCheck, 
  FileText, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

export default function LoginRequiredModal({ 
  isOpen, 
  onClose, 
  material, 
  action = 'access', // 'view' | 'download' | 'access'
  onGoToStudentLogin, 
  onGoToFacultyLogin 
}) {
  if (!isOpen) return null;

  const actionText = action === 'download' ? 'download this worksheet' : (action === 'view' ? 'view this worksheet preview' : 'access this study material');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Visual Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Access Restricted
              </span>
              <h3 className="text-xl font-black tracking-tight text-white mt-1">
                Student or Faculty Login Required
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Worksheets, lecture notes, and question papers are exclusively available to enrolled Excellencia students and registered teachers.
          </p>
        </div>

        {/* Target Document Details */}
        {material && (
          <div className="bg-slate-50 p-4 mx-6 mt-4 rounded-2xl border border-slate-200/80 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {material.subject}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                  {material.category}
                </span>
                <span className="text-[10px] text-slate-500 truncate">
                  By {material.facultyName}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">
                {material.title}
              </p>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="p-6 pt-5 space-y-3">
          <p className="text-xs text-slate-600 text-center font-medium mb-1">
            Please select how you want to log in to {actionText}:
          </p>

          {/* Primary: Student Login */}
          <button
            onClick={() => {
              onClose();
              if (onGoToStudentLogin) onGoToStudentLogin(material);
            }}
            className="w-full flex items-center justify-between p-3.5 px-5 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all active:scale-98 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-amber-300">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm">Log in with Student ID</div>
                <div className="text-[11px] text-blue-200 font-normal">Use your roll number or student ID</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary: Faculty Login */}
          <button
            onClick={() => {
              onClose();
              if (onGoToFacultyLogin) onGoToFacultyLogin();
            }}
            className="w-full flex items-center justify-between p-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold border border-slate-300 transition-all active:scale-98 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm">Faculty / Teacher Portal</div>
                <div className="text-[11px] text-slate-500 font-normal">For lecturers and department heads</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Cancel button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
          >
            Cancel & Return to Materials Hub
          </button>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-100 text-center text-[11px] text-slate-500">
          Excellencia Junior College • West Marredpally Campus
        </div>
      </div>
    </div>
  );
}
