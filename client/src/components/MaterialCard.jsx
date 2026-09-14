import React from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  MessageCircleQuestion, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Layers, 
  Sparkles, 
  ExternalLink,
  Lock
} from 'lucide-react';
import { getProtectedFileUrl } from '../utils/authUrl';

export default function MaterialCard({ 
  material, 
  onOpenDoubtModal, 
  onPreview,
  isAuthenticated = false,
  student = null,
  facultyAuth = null,
  onRequireLogin
}) {
  // Subject badge color scheme
  const getSubjectColor = (subject) => {
    switch (subject.toLowerCase()) {
      case 'mathematics':
      case 'maths':
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-200',
          accent: 'from-indigo-600 to-blue-600',
          iconBg: 'bg-indigo-600'
        };
      case 'physics':
        return {
          bg: 'bg-sky-50',
          text: 'text-sky-700',
          border: 'border-sky-200',
          accent: 'from-sky-600 to-blue-600',
          iconBg: 'bg-sky-600'
        };
      case 'chemistry':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          accent: 'from-emerald-600 to-teal-600',
          iconBg: 'bg-emerald-600'
        };
      case 'biology':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
          accent: 'from-rose-600 to-pink-600',
          iconBg: 'bg-rose-600'
        };
      case 'english':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          accent: 'from-amber-600 to-orange-600',
          iconBg: 'bg-amber-600'
        };
      default:
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-200',
          accent: 'from-slate-600 to-slate-800',
          iconBg: 'bg-slate-700'
        };
    }
  };

  const colors = getSubjectColor(material.subject);
  const isRecent = new Date(material.uploadDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1">
      {/* Card Header Banner */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
              {material.subject}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {material.category}
            </span>
            {isRecent && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> New
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-600 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {material.uploadDate}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2 leading-snug">
          {material.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {material.description || 'Comprehensive study resource and practice set curated by Excellencia faculty.'}
        </p>

        {/* Class/Batch & Questions info */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            {material.classBatch}
          </span>
          {material.totalQuestions > 0 && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {material.totalQuestions} Questions {material.hasSolutions && '• Solved'}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer & Actions */}
      <div className="bg-slate-50/80 p-4 border-t border-slate-100 space-y-3">
        {/* Faculty info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold ${colors.iconBg}`}>
              {material.facultyName.replace('Prof.', '').replace('Dr.', '').replace('Mrs.', '').replace('Mr.', '').trim()[0] || 'F'}
            </div>
            <span className="font-medium text-slate-700 truncate max-w-[150px]">
              {material.facultyName}
            </span>
          </div>
          <span className="text-[11px] text-slate-600 font-mono">
            {material.fileSize}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* View Worksheet */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                if (onRequireLogin) onRequireLogin({ material, action: 'view' });
                return;
              }
              onPreview(material);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 transition-colors shadow-2xs group/btn"
            title={isAuthenticated ? 'Preview Worksheet' : 'Login required to view'}
          >
            {isAuthenticated ? (
              <Eye className="w-3.5 h-3.5 text-blue-700" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-amber-500" />
            )}
            <span>View Worksheet</span>
          </button>

          {/* Download Worksheet */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!isAuthenticated) {
                if (onRequireLogin) onRequireLogin({ material, action: 'download' });
                return;
              }
              const protectedUrl = getProtectedFileUrl(material.fileUrl, student, facultyAuth);
              const link = document.createElement('a');
              link.href = protectedUrl;
              link.download = material.fileName || 'worksheet.pdf';
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs group/btn"
            title={isAuthenticated ? 'Download Worksheet' : 'Login required to download'}
          >
            {isAuthenticated ? (
              <Download className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-300 group-hover/btn:scale-110 transition-transform" />
            )}
            <span>Download</span>
          </button>
        </div>

        {/* WhatsApp Doubt Button directly linked to this worksheet */}
        <button
          onClick={() => onOpenDoubtModal(material)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all"
        >
          <MessageCircleQuestion className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ask Doubt on this Worksheet</span>
        </button>
      </div>
    </div>
  );
}
