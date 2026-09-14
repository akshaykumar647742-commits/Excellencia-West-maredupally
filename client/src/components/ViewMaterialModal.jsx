import React from 'react';
import { X, Download, ExternalLink, FileText, Sparkles, MessageCircleQuestion, Lock, GraduationCap, ShieldCheck } from 'lucide-react';
import { getProtectedFileUrl } from '../utils/authUrl';

export default function ViewMaterialModal({ 
  material, 
  onClose, 
  onAskDoubt,
  student = null,
  facultyAuth = null,
  onRequireLogin
}) {
  if (!material) return null;

  const isAuthenticated = Boolean(student || facultyAuth);
  const protectedUrl = getProtectedFileUrl(material.fileUrl, student, facultyAuth);
  const isPdf = material.fileName && material.fileName.toLowerCase().endsWith('.pdf');

  const handleDownload = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      if (onRequireLogin) onRequireLogin({ material, action: 'download' });
      return;
    }
    const link = document.createElement('a');
    link.href = protectedUrl;
    link.download = material.fileName || 'worksheet.pdf';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 truncate pr-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-sm sm:text-base text-white truncate">
                {material.title}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{material.subject}</span>
                <span>•</span>
                <span>{material.category}</span>
                <span>•</span>
                <span>By {material.facultyName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                onClose();
                onAskDoubt(material);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <MessageCircleQuestion className="w-3.5 h-3.5" />
              <span>Ask Doubt</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              {isAuthenticated ? (
                <Download className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Embedded Preview or Login Wall */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col items-center justify-center">
          {!isAuthenticated ? (
            <div className="bg-white p-8 rounded-3xl max-w-md w-full mx-4 shadow-xl border border-slate-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900">Document Protected</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Please log in with your Student ID or Faculty account to preview and read this worksheet.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onRequireLogin) onRequireLogin({ material, action: 'view' });
                }}
                className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>Log in to View Worksheet</span>
              </button>
            </div>
          ) : material.fileUrl && isPdf ? (
            <iframe
              src={`${protectedUrl}#toolbar=1&navpanes=0`}
              title={material.title}
              className="w-full h-full border-none"
            />
          ) : (
            <div className="text-center p-8 max-w-md">
              <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-slate-800 mb-2">{material.title}</h4>
              <p className="text-sm text-slate-600 mb-6">
                This worksheet or resource is ready to download or view in external application.
              </p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-bold shadow-md hover:bg-blue-800"
              >
                <Download className="w-4 h-4" />
                Download Worksheet ({material.fileSize || 'PDF'})
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer info bar */}
        <div className="bg-white p-3 px-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Campus: Excellencia West Marredpally</span>
          <span className="font-mono">{material.fileName}</span>
        </div>
      </div>
    </div>
  );
}
