import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Phone, 
  Users, 
  BookOpen, 
  Layers, 
  ExternalLink,
  ShieldAlert,
  Clock,
  Send,
  Lock,
  KeyRound,
  ShieldCheck,
  LogOut,
  Sparkles,
  FileSpreadsheet,
  Download,
  MessageSquare,
  HelpCircle,
  RefreshCw,
  Edit3,
  Check,
  Mail,
  Settings,
  X,
  Eye,
  EyeOff,
  Server,
  AtSign,
  Globe,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api';
import { getProtectedFileUrl } from '../utils/authUrl';

export default function FacultyPortal({ 
  materials = [], 
  facultyList = [], 
  students = [], 
  onMaterialUploaded, 
  onMaterialDeleted, 
  onFacultyUpdated,
  onStudentAdded,
  onBackToMaterials 
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'materials' | 'faculty' | 'students' | 'doubts'
  
  // Faculty Authentication state
  const [facultyAuth, setFacultyAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('excellencia_faculty_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Master Admin check (Restricted to Akshay / FAC00)
  const isMasterAdmin = Boolean(
    facultyAuth?.id === 'FAC00' || 
    facultyAuth?.name?.toLowerCase().includes('akshay') || 
    facultyAuth?.isAdmin
  );

  const [loginPasscode, setLoginPasscode] = useState('');
  const [selectedFacultyLoginId, setSelectedFacultyLoginId] = useState(facultyList[0]?.id || '');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleFacultyLogin = async (e) => {
    if (e) e.preventDefault();
    if (!loginPasscode.trim()) {
      setLoginError('Please enter the Faculty Passcode');
      return;
    }
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await api.loginFaculty(loginPasscode, selectedFacultyLoginId);
      if (res.success && res.faculty) {
        setFacultyAuth(res.faculty);
        localStorage.setItem('excellencia_faculty_auth', JSON.stringify(res.faculty));
        setFacultyId(res.faculty.id);
        if (res.faculty.subject) setSubject(res.faculty.subject);
      } else {
        setLoginError(res.message || 'Invalid passcode');
      }
    } catch (err) {
      setLoginError('Could not verify with server: ' + err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleFacultyLogout = () => {
    setFacultyAuth(null);
    localStorage.removeItem('excellencia_faculty_auth');
  };

  // Upload form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(facultyAuth?.subject || 'Mathematics');
  const [category, setCategory] = useState('Worksheet');
  const [classBatch, setClassBatch] = useState('Class 11 - JEE Batch A');
  const [description, setDescription] = useState('');
  const [facultyId, setFacultyId] = useState(facultyAuth?.id || facultyList[0]?.id || '');
  const [totalQuestions, setTotalQuestions] = useState('');
  const [hasSolutions, setHasSolutions] = useState(true);
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Faculty form state
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    subject: 'Mathematics',
    phone: '',
    email: '',
    designation: '',
    availableHours: '4:00 PM - 8:00 PM'
  });
  const [facultyMsg, setFacultyMsg] = useState('');

  // Student quick add form
  const [newStudent, setNewStudent] = useState({
    id: '',
    name: '',
    classBatch: 'Class 11 - JEE Batch A',
    stream: 'MPC'
  });
  const [studentMsg, setStudentMsg] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [deletingStudentId, setDeletingStudentId] = useState(null);
  const [deletingFacultyId, setDeletingFacultyId] = useState(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Excel Bulk Upload state
  const [excelFile, setExcelFile] = useState(null);
  const [excelUploading, setExcelUploading] = useState(false);
  const [excelMsg, setExcelMsg] = useState('');
  const [excelError, setExcelError] = useState('');

  // Doubts Inbox state
  const [doubts, setDoubts] = useState([]);
  const [loadingDoubts, setLoadingDoubts] = useState(false);
  const [adminViewAllDoubts, setAdminViewAllDoubts] = useState(false);
  const [doubtStatusFilter, setDoubtStatusFilter] = useState('all'); // 'all' | 'pending' | 'answered'
  const [doubtSubjectFilter, setDoubtSubjectFilter] = useState('all');
  const [answeringDoubtId, setAnsweringDoubtId] = useState(null);
  const [answerDraft, setAnswerDraft] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [doubtsActionMsg, setDoubtsActionMsg] = useState('');

  const loadDoubts = async (viewAllOverride = null) => {
    try {
      setLoadingDoubts(true);
      const shouldViewAll = viewAllOverride !== null ? viewAllOverride : adminViewAllDoubts;
      const params = {};
      // If NOT master admin, OR if master admin is viewing their own doubts, strictly scope to facultyAuth.id
      if (!isMasterAdmin || !shouldViewAll) {
        if (facultyAuth?.id) {
          params.facultyId = facultyAuth.id;
        }
      }
      const data = await api.getDoubts(params);
      setDoubts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching doubts in faculty portal:', err);
    } finally {
      setLoadingDoubts(false);
    }
  };

  // Email Notification & SMTP Settings state
  const [showEmailSettingsModal, setShowEmailSettingsModal] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: '',
    smtpPass: '',
    smtpPassMasked: '',
    hasPassword: false,
    smtpFrom: 'Excellencia Academic Portal',
    isConfigured: false
  });
  const [loadingEmailConfig, setLoadingEmailConfig] = useState(false);
  const [savingEmailConfig, setSavingEmailConfig] = useState(false);
  const [emailSaveSuccess, setEmailSaveSuccess] = useState('');
  const [emailSaveError, setEmailSaveError] = useState('');
  
  // Test email state
  const [testRecipient, setTestRecipient] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null);
  
  // Email logs state
  const [emailLogs, setEmailLogs] = useState([]);
  const [loadingEmailLogs, setLoadingEmailLogs] = useState(false);
  const [showAppPassword, setShowAppPassword] = useState(false);
  const [emailSettingsTab, setEmailSettingsTab] = useState('settings'); // 'settings' | 'test' | 'logs'
  const [showGoogleGuide, setShowGoogleGuide] = useState(false);

  const loadEmailConfig = async () => {
    try {
      setLoadingEmailConfig(true);
      const data = await api.getEmailConfig();
      if (data) {
        setEmailConfig({
          smtpHost: data.smtpHost || 'smtp.gmail.com',
          smtpPort: data.smtpPort || 587,
          smtpSecure: Boolean(data.smtpSecure),
          smtpUser: data.smtpUser || '',
          smtpPass: '',
          smtpPassMasked: data.smtpPassMasked || '',
          hasPassword: Boolean(data.hasPassword),
          smtpFrom: data.smtpFrom || 'Excellencia Academic Portal',
          isConfigured: Boolean(data.isConfigured)
        });
        if (!testRecipient && facultyAuth?.email) {
          setTestRecipient(facultyAuth.email);
        }
      }
    } catch (err) {
      console.error('Error loading email config:', err);
    } finally {
      setLoadingEmailConfig(false);
    }
  };

  const loadEmailLogs = async () => {
    try {
      setLoadingEmailLogs(true);
      const logs = await api.getNotificationLogs();
      setEmailLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      console.error('Error loading email logs:', err);
    } finally {
      setLoadingEmailLogs(false);
    }
  };

  const handleSaveEmailConfig = async (e) => {
    e.preventDefault();
    try {
      setSavingEmailConfig(true);
      setEmailSaveSuccess('');
      setEmailSaveError('');

      const res = await api.saveEmailConfig(emailConfig);
      if (res.success) {
        setEmailSaveSuccess('Email settings saved successfully!');
        setEmailConfig(prev => ({
          ...prev,
          smtpPass: '',
          smtpPassMasked: '••••••••••••••••',
          hasPassword: true,
          isConfigured: res.config?.isConfigured
        }));
        setTimeout(() => setEmailSaveSuccess(''), 4000);
      } else {
        setEmailSaveError(res.message || 'Failed to save settings');
      }
    } catch (err) {
      setEmailSaveError(err.message || 'Network error saving settings');
    } finally {
      setSavingEmailConfig(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testRecipient || !testRecipient.trim()) {
      setTestEmailResult({ success: false, message: 'Please enter a recipient email address' });
      return;
    }

    try {
      setSendingTestEmail(true);
      setTestEmailResult(null);

      const res = await api.sendTestEmail(testRecipient.trim());
      if (res.success) {
        setTestEmailResult({
          success: true,
          message: `✅ Test email successfully dispatched to ${testRecipient}! Check your inbox (or spam folder).`
        });
        loadEmailLogs();
      } else {
        setTestEmailResult({
          success: false,
          message: res.message || 'Failed to dispatch test email.'
        });
      }
    } catch (err) {
      setTestEmailResult({
        success: false,
        message: err.message || 'Error communicating with email server.'
      });
    } finally {
      setSendingTestEmail(false);
    }
  };

  useEffect(() => {
    if (facultyAuth) {
      loadDoubts();
      loadEmailConfig();
    }
  }, [facultyAuth, adminViewAllDoubts]);

  const handleStartAnswering = (doubt) => {
    setAnsweringDoubtId(doubt.id);
    setAnswerDraft(doubt.answer || '');
  };

  const handleCancelAnswering = () => {
    setAnsweringDoubtId(null);
    setAnswerDraft('');
  };

  const handleAnswerSubmit = async (doubtId) => {
    if (!answerDraft.trim()) {
      alert('Please enter an answer or solution first!');
      return;
    }
    setSubmittingAnswer(true);
    try {
      const res = await api.answerDoubt(doubtId, {
        answer: answerDraft.trim(),
        answeredBy: facultyAuth?.name || 'Faculty Member',
        facultyId: facultyAuth?.id || 'FAC01'
      });
      if (res.success) {
        setDoubts(prev => prev.map(d => d.id === doubtId ? res.doubt : d));
        setAnsweringDoubtId(null);
        setAnswerDraft('');
        setDoubtsActionMsg('✓ Solution published! Student can now view it in their dashboard.');
        setTimeout(() => setDoubtsActionMsg(''), 4000);
      } else {
        alert('Failed to save answer: ' + (res.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Error saving answer: ' + err.message);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleDeleteDoubt = async (doubtId) => {
    if (!window.confirm('Are you sure you want to delete this doubt record?')) return;
    try {
      const res = await api.deleteDoubt(doubtId);
      if (res.success) {
        setDoubts(prev => prev.filter(d => d.id !== doubtId));
        setDoubtsActionMsg('Doubt record deleted.');
        setTimeout(() => setDoubtsActionMsg(''), 3000);
      }
    } catch (err) {
      alert('Error deleting doubt: ' + err.message);
    }
  };

  const handleBulkExcelUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      setExcelError('Please select an Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setExcelUploading(true);
    setExcelError('');
    setExcelMsg('');

    try {
      const formData = new FormData();
      formData.append('file', excelFile);

      const res = await api.bulkUploadStudents(formData);
      if (res.success) {
        setExcelMsg(res.message);
        setExcelFile(null);
        // Reset file input
        const fileInput = document.getElementById('excelFileInput');
        if (fileInput) fileInput.value = '';
        onStudentAdded();
      } else {
        setExcelError(res.message || 'Failed to process Excel file');
      }
    } catch (err) {
      setExcelError('Error uploading Excel file: ' + err.message);
    } finally {
      setExcelUploading(false);
    }
  };


  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setUploadError('Please enter a worksheet/material title');
      return;
    }

    if (!file && !externalUrl.trim()) {
      setUploadError('Please upload a PDF document or provide a Google Drive / resource URL');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const selectedFac = facultyList.find(f => f.id === facultyId) || facultyList[0];
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subject', subject);
      formData.append('category', category);
      formData.append('classBatch', classBatch);
      formData.append('description', description);
      formData.append('facultyName', selectedFac ? selectedFac.name : 'Excellencia Faculty');
      formData.append('facultyId', selectedFac ? selectedFac.id : '');
      formData.append('totalQuestions', totalQuestions || '0');
      formData.append('hasSolutions', hasSolutions ? 'true' : 'false');
      formData.append('tags', tags || `${subject}, ${category}`);

      if (file) {
        formData.append('file', file);
      } else if (externalUrl) {
        formData.append('externalUrl', externalUrl);
      }

      const res = await api.uploadMaterial(formData);
      if (res.success && res.material) {
        setUploadSuccess(`Successfully uploaded "${res.material.title}"! It is now visible to all students.`);
        // Reset form
        setTitle('');
        setDescription('');
        setTotalQuestions('');
        setTags('');
        setFile(null);
        setExternalUrl('');
        // Notify parent
        onMaterialUploaded(res.material);
      } else {
        setUploadError(res.message || 'Upload failed. Please try again.');
      }
    } catch (err) {
      setUploadError('Error uploading material: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, matTitle) => {
    if (!confirm(`Are you sure you want to delete "${matTitle}"?`)) return;
    try {
      await api.deleteMaterial(id);
      onMaterialDeleted(id);
    } catch (e) {
      alert('Failed to delete material');
    }
  };

  const handleSaveFaculty = async (e) => {
    e.preventDefault();
    if (!newFaculty.name.trim() || !newFaculty.phone.trim()) {
      setFacultyMsg('Faculty name and WhatsApp phone number are required.');
      return;
    }
    try {
      const res = await api.saveFaculty(newFaculty);
      if (res.success) {
        setFacultyMsg(newFaculty.id ? 'Faculty details updated successfully!' : 'Faculty profile & email saved successfully!');
        setNewFaculty({ name: '', subject: 'Mathematics', phone: '', email: '', designation: '', availableHours: '4:00 PM - 8:00 PM' });
        onFacultyUpdated();
      }
    } catch (err) {
      setFacultyMsg('Error saving faculty: ' + err.message);
    }
  };

  const handleDeleteFaculty = async (faculty) => {
    if (faculty.id === 'FAC00') {
      alert('Primary Administrator (Akshay) cannot be removed.');
      return;
    }
    if (!confirm(`Are you sure you want to remove "${faculty.name}" (${faculty.subject}) from the faculty registry?\n\nThis will remove their WhatsApp doubt consultation channel and portal access.`)) {
      return;
    }
    setDeletingFacultyId(faculty.id);
    try {
      const res = await api.deleteFaculty(faculty.id);
      if (res.success) {
        setFacultyMsg(`✓ Faculty member "${faculty.name}" removed successfully.`);
        if (onFacultyUpdated) onFacultyUpdated();
      } else {
        alert(res.message || 'Failed to remove faculty');
      }
    } catch (err) {
      alert('Error removing faculty: ' + err.message);
    } finally {
      setDeletingFacultyId(null);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!confirm(`Are you sure you want to remove student "${student.name}" (ID: ${student.id}) from the registry?\n\nThey will no longer be able to log in to access protected materials.`)) {
      return;
    }
    setDeletingStudentId(student.id);
    try {
      const res = await api.deleteStudent(student.id);
      if (res.success) {
        setStudentMsg(`✓ Student ${student.name} (${student.id}) removed successfully.`);
        setSelectedStudentIds(prev => prev.filter(id => id !== student.id));
        if (onStudentAdded) onStudentAdded();
      } else {
        alert(res.message || 'Failed to remove student');
      }
    } catch (err) {
      alert('Error removing student: ' + err.message);
    } finally {
      setDeletingStudentId(null);
    }
  };

  const handleBulkDeleteStudents = async () => {
    if (selectedStudentIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete all ${selectedStudentIds.length} selected student(s) from the portal registry?\n\nThis action cannot be undone.`)) {
      return;
    }
    setIsBulkDeleting(true);
    try {
      const res = await api.bulkDeleteStudents(selectedStudentIds);
      if (res.success) {
        setStudentMsg(`✓ ${res.removedCount || selectedStudentIds.length} student(s) removed successfully from registry.`);
        setSelectedStudentIds([]);
        if (onStudentAdded) onStudentAdded();
      } else {
        alert(res.message || 'Failed to delete selected students');
      }
    } catch (err) {
      alert('Error deleting students: ' + err.message);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.id.trim() || !newStudent.name.trim()) {
      setStudentMsg('Student ID and Name are required.');
      return;
    }
    try {
      const res = await api.registerStudent(newStudent);
      if (res.success) {
        setStudentMsg(`Student ID ${res.student.id} (${res.student.name}) added!`);
        setNewStudent({ id: '', name: '', classBatch: 'Class 11 - JEE Batch A', stream: 'MPC' });
        onStudentAdded();
      } else {
        setStudentMsg(res.message || 'Failed to add student');
      }
    } catch (err) {
      setStudentMsg('Error adding student');
    }
  };

  if (!facultyAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Faculty Portal Access</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Restricted to Excellencia Junior College West Marredpally Teachers & Staff to upload worksheets & manage study materials.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleFacultyLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Your Faculty Profile
              </label>
              <select
                value={selectedFacultyLoginId}
                onChange={(e) => setSelectedFacultyLoginId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {facultyList.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.subject} ({f.designation || 'Faculty'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Teacher Access Passcode
                </label>
                <button
                  type="button"
                  onClick={() => setLoginPasscode('excellencia2026')}
                  className="text-[11px] text-amber-600 font-bold hover:underline"
                >
                  Quick Fill Passcode
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter Faculty Passcode"
                  value={loginPasscode}
                  onChange={(e) => setLoginPasscode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                College demo passcode: <strong className="text-slate-600 font-mono">excellencia2026</strong>
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loginLoading}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loginLoading ? 'Verifying...' : 'Log In as Teacher'}</span>
              </button>
              <button
                type="button"
                onClick={onBackToMaterials}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
              >
                Back
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Academic Staff Authentication</span>
          </div>
        </div>
      </div>
    );
  }

  const filteredStudents = students.filter(s => 
    !studentSearchQuery ||
    s.id.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    (s.phone && s.phone.includes(studentSearchQuery)) ||
    (s.classBatch && s.classBatch.toLowerCase().includes(studentSearchQuery.toLowerCase())) ||
    (s.stream && s.stream.toLowerCase().includes(studentSearchQuery.toLowerCase()))
  );
  const isAllFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.includes(s.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              isMasterAdmin 
                ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-300 font-extrabold' 
                : 'bg-blue-600 text-white'
            }`}>
              {isMasterAdmin ? '👑 Master Administrator' : 'Faculty Member'}
            </span>
            <span className="text-slate-400 text-xs">• West Marredpally</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Excellencia Faculty Management Portal</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Logged in as: <strong className="text-amber-400 font-semibold">{facultyAuth.name}</strong> ({facultyAuth.subject || 'Faculty'})
            {isMasterAdmin ? (
              <span className="ml-2 text-emerald-400 text-xs font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-700">
                ✓ Full Admin Editing Access (Teachers & Students)
              </span>
            ) : (
              <span className="ml-2 text-slate-400 text-xs bg-slate-800 px-2 py-0.5 rounded-md">
                Worksheet Upload Access Only
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleFacultyLogout}
            className="px-3.5 py-2 bg-slate-800 hover:bg-rose-900/60 hover:text-rose-300 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
            title="Logout Faculty Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Teacher</span>
          </button>
          <button
            onClick={onBackToMaterials}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold self-start md:self-auto transition-colors"
          >
            ← Back to Student View
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Worksheets & Materials</span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'materials'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Manage Uploads ({materials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'faculty'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Faculty Directory ({facultyList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'students'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student IDs ({students.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('doubts');
            loadDoubts();
          }}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'doubts'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Student Doubts Inbox</span>
          {doubts.filter(d => d.status === 'pending').length > 0 ? (
            <span className="px-1.5 py-0.5 text-[10px] font-black bg-amber-400 text-slate-950 rounded-full">
              {doubts.filter(d => d.status === 'pending').length} new
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">({doubts.length})</span>
          )}
        </button>
      </div>

      {/* TAB 1: UPLOAD MATERIALS */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-4xl">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Upload New Study Material / Worksheet</h3>
            <p className="text-xs text-slate-500">
              Files uploaded here are instantly available to all students on the "At a Glance" dashboard.
            </p>
          </div>

          {uploadSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Uploaded Successfully!</p>
                <p className="text-xs">{uploadSuccess}</p>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Upload Notice</p>
                <p className="text-xs">{uploadError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Worksheet / Material Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Thermodynamics - Second Law & Heat Engines Practice Set"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            {/* Subject & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Subject *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                >
                  <option value="Worksheet">Worksheet</option>
                  <option value="Daily Practice Problems (DPP)">Daily Practice Problems (DPP)</option>
                  <option value="Lecture Notes">Lecture Notes</option>
                  <option value="Formula Sheet">Formula Sheet</option>
                  <option value="Previous Year Papers">Previous Year Papers</option>
                </select>
              </div>
            </div>

            {/* Target Class/Batch & Uploading Faculty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Target Class / Batch
                </label>
                <select
                  value={classBatch}
                  onChange={(e) => setClassBatch(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                >
                  <option value="All Batches">All Batches (Class 11 & 12)</option>
                  <option value="Class 11 - JEE Batch A">Class 11 - JEE Batch A</option>
                  <option value="Class 11 - NEET Medical">Class 11 - NEET Medical</option>
                  <option value="Class 11 - Foundation">Class 11 - Foundation</option>
                  <option value="Class 12 - JEE Advanced">Class 12 - JEE Advanced</option>
                  <option value="Class 12 - NEET Medical">Class 12 - NEET Medical</option>
                  <option value="Class 12 - IPE Focus">Class 12 - IPE Focus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Uploading Faculty Member (For Doubts Routing) *
                </label>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                >
                  {facultyList.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.subject} • +91 {f.phone.slice(-10)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Description / Chapter Instructions
              </label>
              <textarea
                rows={2}
                placeholder="Give brief instructions, e.g. 'Solve questions 1-20 before Wednesday's session.'"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            {/* Questions count & Solutions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Total Questions (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="solutionsCheck"
                  checked={hasSolutions}
                  onChange={(e) => setHasSolutions(e.target.checked)}
                  className="w-5 h-5 text-blue-900 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="solutionsCheck" className="text-xs sm:text-sm font-bold text-slate-700">
                  Detailed Answer Key / Solutions Included
                </label>
              </div>
            </div>

            {/* File Upload Box */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Attach Document (PDF, Word, or Image)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors bg-slate-50">
                <Upload className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                <input
                  type="file"
                  id="materialFile"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <label
                  htmlFor="materialFile"
                  className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-blue-900 hover:bg-slate-50 shadow-2xs"
                >
                  Choose File from Computer
                </label>
                {file ? (
                  <p className="mt-2 text-xs font-bold text-emerald-700">
                    ✓ Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    Supports PDF, DOC, DOCX up to 50MB
                  </p>
                )}
              </div>
            </div>

            {/* Or External Link */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Or Google Drive / Resource Link (If file is already online)
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-800"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3.5 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>{uploading ? 'Publishing Worksheet...' : 'Publish Worksheet for Students'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: MANAGE MATERIALS */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              All Published Materials & Worksheets ({materials.length})
            </h3>
            <button
              onClick={() => setActiveTab('upload')}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-900 text-white rounded-xl text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> Upload Another
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Title & Subject</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Batch</th>
                  <th className="py-3 px-3">Faculty</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div>{m.title}</div>
                      <span className="text-[11px] text-blue-700 font-medium">{m.subject}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{m.category}</td>
                    <td className="py-3 px-3 text-slate-600">{m.classBatch}</td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{m.facultyName}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono">{m.uploadDate}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={getProtectedFileUrl(m.fileUrl, null, facultyAuth)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                          title="View / Download"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(m.id, m.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Worksheet"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FACULTY WHATSAPP CONTACTS */}
      {activeTab === 'faculty' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Active Faculty Doubt Channels ({facultyList.length})
              </h3>
              <p className="text-xs text-slate-500">
                When a student clicks "Ask Doubt" on the website, their message routes to this WhatsApp number.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {facultyList.map(f => (
                <div key={f.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-900 text-white font-bold flex items-center justify-center text-sm">
                      {f.name?.trim()[0] || 'F'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{f.name}</h4>
                      <p className="text-xs text-blue-700 font-medium">
                        {f.subject} • {f.designation || f.department}
                      </p>
                      {f.email ? (
                        <p className="text-[11px] text-blue-800 font-mono flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-blue-600" />
                          <span>{f.email}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic mt-0.5">
                          No notification email set
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Doubts Hours: {f.availableHours || '4:00 PM - 8:00 PM'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      +91 {f.phone.slice(-10)}
                    </span>
                    <a
                      href={`https://api.whatsapp.com/send?phone=${f.phone}&text=${encodeURIComponent('Hello Sir/Madam, testing Excellencia WhatsApp doubt integration.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1"
                      title="Send test WhatsApp message"
                    >
                      <Send className="w-3 h-3" />
                      <span>Test</span>
                    </a>

                    {isMasterAdmin && (
                      f.id === 'FAC00' ? (
                        <span 
                          className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl"
                          title="Primary Portal Administrator (Protected from deletion)"
                        >
                          👑 Primary Admin (Protected)
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setNewFaculty({
                                id: f.id,
                                name: f.name,
                                subject: f.subject,
                                phone: f.phone.slice(-10),
                                email: f.email || '',
                                designation: f.designation || '',
                                availableHours: f.availableHours || '4:00 PM - 8:00 PM'
                              });
                              setFacultyMsg(`Editing "${f.name}". Modify details and click Update Faculty.`);
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title={`Edit ${f.name} details`}
                          >
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            disabled={deletingFacultyId === f.id}
                            onClick={() => handleDeleteFaculty(f)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                            title={`Remove ${f.name} from faculty registry`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>{deletingFacultyId === f.id ? 'Removing...' : 'Remove'}</span>
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add / Update Faculty Card (Master Admin Only - Prof. Akshay) */}
          {isMasterAdmin ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add / Update Faculty</h3>
                  <p className="text-xs text-slate-500">Configure contact numbers and email addresses for automated doubt notifications.</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] uppercase border border-amber-300">
                  Admin Only
                </span>
              </div>

              {facultyMsg && (
                <p className="text-xs p-2.5 bg-blue-50 text-blue-800 rounded-xl font-medium border border-blue-200">
                  {facultyMsg}
                </p>
              )}

            <form onSubmit={handleSaveFaculty} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Anirudh Sharma"
                  value={newFaculty.name}
                  onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
                <select
                  value={newFaculty.subject}
                  onChange={(e) => setNewFaculty({ ...newFaculty, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Email Address (For Doubt Alerts) *</label>
                <input
                  type="email"
                  placeholder="e.g. teacher@excellencia.edu.in or personal gmail"
                  value={newFaculty.email}
                  onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  The website automatically sends an email notification to this address whenever a student submits a doubt for this teacher.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Phone Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. 9848012345 (10 digits)"
                  value={newFaculty.phone}
                  onChange={(e) => setNewFaculty({ ...newFaculty, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doubt Clearing Hours</label>
                <input
                  type="text"
                  placeholder="e.g. 4:30 PM - 8:30 PM"
                  value={newFaculty.availableHours}
                  onChange={(e) => setNewFaculty({ ...newFaculty, availableHours: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {newFaculty.id ? 'Update Faculty Member' : 'Save Faculty Contact'}
                </button>
                {newFaculty.id && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewFaculty({ name: '', subject: 'Mathematics', phone: '', designation: '', availableHours: '4:00 PM - 8:00 PM' });
                      setFacultyMsg('');
                    }}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-50 to-amber-50/50 rounded-3xl p-6 border border-amber-200 shadow-sm text-center space-y-3 self-start">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900">Admin Editing Locked</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Only <strong>Akshay (Portal Administrator)</strong> has permission to modify faculty phone numbers and WhatsApp consultation channels.
              </p>
              <div className="pt-2 text-[11px] text-amber-800 font-bold">
                Logged in as Faculty Member (View Only)
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: STUDENT DIRECTORY */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 cols: Student Table & Search */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registered Excellencia Student IDs ({students.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Students can log into the portal instantly using their ID number.
                </p>
              </div>

              {/* Instant Search Bar */}
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search by ID, Name or Phone..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notification message */}
            {studentMsg && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900 font-semibold">
                <span>{studentMsg}</span>
                <button 
                  type="button" 
                  onClick={() => setStudentMsg('')} 
                  className="text-blue-500 hover:text-blue-700 text-xs cursor-pointer ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Bulk Selection Action Bar for Admin */}
            {isMasterAdmin && selectedStudentIds.length > 0 && (
              <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2 text-rose-900 font-bold">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-black">
                    {selectedStudentIds.length}
                  </span>
                  <span>{selectedStudentIds.length} student{selectedStudentIds.length > 1 ? 's' : ''} selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentIds([])}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Deselect All
                  </button>
                  <button
                    type="button"
                    disabled={isBulkDeleting}
                    onClick={handleBulkDeleteStudents}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedStudentIds.length})`}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 shadow-2xs z-10">
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    {isMasterAdmin && (
                      <th className="py-2.5 px-3 w-9 text-center">
                        <input
                          type="checkbox"
                          checked={isAllFilteredSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const visibleIds = filteredStudents.map(s => s.id);
                              setSelectedStudentIds(prev => Array.from(new Set([...prev, ...visibleIds])));
                            } else {
                              const visibleIdSet = new Set(filteredStudents.map(s => s.id));
                              setSelectedStudentIds(prev => prev.filter(id => !visibleIdSet.has(id)));
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5 align-middle"
                          title="Select all visible students"
                        />
                      </th>
                    )}
                    <th className="py-2.5 px-3">Student ID</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Batch & Stream</th>
                    <th className="py-2.5 px-3">Parent Phone</th>
                    {isMasterAdmin && (
                      <th className="py-2.5 px-3 text-right">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={isMasterAdmin ? 6 : 4} className="py-8 text-center text-slate-400 text-xs">
                        No students found matching "{studentSearchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(s => {
                      const isSelected = selectedStudentIds.includes(s.id);
                      const isDeleting = deletingStudentId === s.id;
                      return (
                        <tr 
                          key={s.id} 
                          className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50 font-medium' : ''}`}
                        >
                          {isMasterAdmin && (
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStudentIds(prev => [...prev, s.id]);
                                  } else {
                                    setSelectedStudentIds(prev => prev.filter(id => id !== s.id));
                                  }
                                }}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5 align-middle"
                              />
                            </td>
                          )}
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{s.id}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{s.name}</td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {s.classBatch} • <span className="text-slate-500">{s.stream}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                            {s.phone || '—'}
                          </td>
                          {isMasterAdmin && (
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => handleDeleteStudent(s)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center"
                                title={`Remove student ${s.name} (${s.id})`}
                              >
                                <Trash2 className="w-4 h-4 text-rose-500" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right col: Admin Controls (Excel Bulk Import + Manual Enrollment) */}
          {isMasterAdmin ? (
            <div className="space-y-6">
              {/* CARD 1: EXCEL BULK IMPORT */}
              <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Upload Excel Sheet</h3>
                      <p className="text-[11px] text-slate-500">Import student roster (.xlsx, .xls, .csv)</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase border border-emerald-200">
                    Bulk Excel
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                  <p className="font-semibold text-slate-800">Auto-Detects Excel Columns:</p>
                  <p className="text-slate-500">
                    Works with <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700 font-mono">Student ID / Roll No</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700 font-mono">Student Name</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700 font-mono">Class / Batch</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700 font-mono">Phone</code>.
                  </p>
                  <a
                    href="/api/students/sample-template"
                    download="Excellencia_Student_Upload_Template.xlsx"
                    className="inline-flex items-center gap-1 text-blue-700 font-bold hover:underline pt-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Sample Excel Template</span>
                  </a>
                </div>

                {excelMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{excelMsg}</span>
                  </div>
                )}

                {excelError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{excelError}</span>
                  </div>
                )}

                <form onSubmit={handleBulkExcelUpload} className="space-y-3">
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                    <input
                      type="file"
                      id="excelFileInput"
                      accept=".xlsx, .xls, .csv"
                      onChange={(e) => setExcelFile(e.target.files[0])}
                      className="hidden"
                    />
                    <label
                      htmlFor="excelFileInput"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>{excelFile ? 'Change File' : 'Choose Excel (.xlsx / .csv)'}</span>
                    </label>
                    {excelFile ? (
                      <p className="mt-2 text-xs font-bold text-emerald-700 truncate">
                        ✓ {excelFile.name} ({(excelFile.size / 1024).toFixed(1)} KB)
                      </p>
                    ) : (
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Choose college Excel sheet from your device
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={excelUploading || !excelFile}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{excelUploading ? 'Parsing & Importing Students...' : 'Upload & Enroll All Students'}</span>
                  </button>
                </form>
              </div>

              {/* CARD 2: MANUAL SINGLE STUDENT ENROLLMENT */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Add Individual Student</h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                    Manual
                  </span>
                </div>
                {studentMsg && (
                  <p className="text-xs p-2.5 bg-blue-50 text-blue-800 rounded-xl font-medium border border-blue-200">
                    {studentMsg}
                  </p>
                )}
                <form onSubmit={handleAddStudent} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student ID / Roll No *</label>
                    <input
                      type="text"
                      placeholder="e.g. 925001 or EXM106"
                      value={newStudent.id}
                      onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Class / Batch</label>
                    <input
                      type="text"
                      placeholder="e.g. Class 12 - Senior Sankalp (MPC)"
                      value={newStudent.classBatch}
                      onChange={(e) => setNewStudent({ ...newStudent, classBatch: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Stream</label>
                    <input
                      type="text"
                      placeholder="e.g. MPC or BiPC"
                      value={newStudent.stream}
                      onChange={(e) => setNewStudent({ ...newStudent, stream: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Register Single Student
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-50 to-amber-50/50 rounded-3xl p-6 border border-amber-200 shadow-sm text-center space-y-3 self-start">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900">Admin Editing Locked</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Enrolling new student IDs and editing the student registry is strictly restricted to <strong>Akshay (Portal Administrator)</strong>.
              </p>
              <div className="pt-2 text-[11px] text-amber-800 font-bold">
                Logged in as Faculty Member (View Only)
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: STUDENT DOUBTS INBOX */}
      {activeTab === 'doubts' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200 uppercase tracking-wider">
                  Live Student Queries
                </span>
                <span className="text-slate-400 text-xs">• In-Portal Doubt Resolution</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-700" />
                <span>Student Academic Doubts Inbox</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
                Students ask doubts directly on worksheets and DPPs from their dashboard. Write your step-by-step explanations or hints here — your answer publishes directly to the student's logged-in dashboard.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
              <button
                onClick={() => {
                  setShowEmailSettingsModal(true);
                  loadEmailConfig();
                  loadEmailLogs();
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs border ${
                  emailConfig?.isConfigured
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 ring-2 ring-amber-400/30'
                }`}
                title="Configure Google App Password or SMTP and test live email delivery"
              >
                <Mail className="w-3.5 h-3.5 text-blue-700" />
                <span>{emailConfig?.isConfigured ? '📧 Email Alerts: Active' : '⚙️ Configure Real Email Alerts'}</span>
                {emailConfig?.isConfigured ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                )}
              </button>

              <button
                onClick={() => loadDoubts()}
                disabled={loadingDoubts}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDoubts ? 'animate-spin' : ''}`} />
                <span>Refresh Doubts</span>
              </button>
            </div>
          </div>

          {/* Privacy Scoping & Oversight Banner */}
          {isMasterAdmin ? (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  👑
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Administrator Doubts Scope</h4>
                  <p className="text-slate-600 text-[11px]">
                    Switch between your personal assigned doubts and campus-wide oversight.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-amber-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setAdminViewAllDoubts(false);
                    loadDoubts(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    !adminViewAllDoubts
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Doubts ({doubts.filter(d => d.facultyId === facultyAuth?.id).length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminViewAllDoubts(true);
                    loadDoubts(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    adminViewAllDoubts
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Faculty Doubts ({doubts.length})
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  🔒
                </div>
                <div>
                  <p className="font-bold text-blue-950">Faculty Privacy Active</p>
                  <p className="text-blue-700 text-[11px]">
                    Showing doubts submitted specifically to <strong>{facultyAuth?.name}</strong>. Doubts directed to other faculty members are private and hidden from your account.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block px-3 py-1 bg-white text-blue-900 rounded-xl font-bold border border-blue-200 text-[11px]">
                {doubts.length} Assigned {doubts.length === 1 ? 'Doubt' : 'Doubts'}
              </span>
            </div>
          )}

          {/* Action Message Banner */}
          {doubtsActionMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{doubtsActionMsg}</span>
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setDoubtStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  doubtStatusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({doubts.length})
              </button>
              <button
                onClick={() => setDoubtStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  doubtStatusFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-amber-800 hover:text-amber-900'
                }`}
              >
                <span>Pending Review</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                  {doubts.filter(d => d.status === 'pending').length}
                </span>
              </button>
              <button
                onClick={() => setDoubtStatusFilter('answered')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  doubtStatusFilter === 'answered'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-emerald-800 hover:text-emerald-900'
                }`}
              >
                <span>Answered</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-black">
                  {doubts.filter(d => d.status === 'answered').length}
                </span>
              </button>
            </div>

            {/* Subject Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Filter by Subject:</span>
              <select
                value={doubtSubjectFilter}
                onChange={(e) => setDoubtSubjectFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-700"
              >
                <option value="all">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
              </select>
            </div>
          </div>

          {/* Doubts List */}
          {loadingDoubts ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 text-blue-600" />
              <p className="text-xs font-semibold">Loading student questions...</p>
            </div>
          ) : doubts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No Student Doubts Logged Yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When students encounter questions in worksheets or DPPs and click "Ask Doubt", their questions will appear right here for your team to solve.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {doubts
                .filter(d => {
                  if (doubtStatusFilter !== 'all' && d.status !== doubtStatusFilter) return false;
                  if (doubtSubjectFilter !== 'all' && d.subject?.toLowerCase() !== doubtSubjectFilter.toLowerCase()) return false;
                  return true;
                })
                .map(doubt => {
                  const isPending = doubt.status === 'pending';
                  const isAnsweringThis = answeringDoubtId === doubt.id;

                  return (
                    <div 
                      key={doubt.id}
                      className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                        isPending 
                          ? 'border-amber-300 shadow-md ring-1 ring-amber-200' 
                          : 'border-slate-200 shadow-xs'
                      }`}
                    >
                      {/* Top Header of Card */}
                      <div className="p-5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider ${
                            doubt.subject?.toLowerCase() === 'mathematics' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                            doubt.subject?.toLowerCase() === 'physics' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                            doubt.subject?.toLowerCase() === 'chemistry' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {doubt.subject}
                          </span>

                          <span className="text-xs text-slate-400">•</span>

                          <span className="text-xs font-bold text-slate-700">
                            {doubt.topic || 'General Problem'}
                          </span>

                          {doubt.questionRef && (
                            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono text-slate-600">
                              Ref: {doubt.questionRef}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {doubt.notificationStatus === 'sent_to_faculty' && (
                            <span 
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                              title={`Automated website email notification sent to ${doubt.facultyEmail || 'teacher'}`}
                            >
                              <Mail className="w-3 h-3 text-emerald-600" />
                              <span>Email Alert Sent</span>
                            </span>
                          )}

                          {isPending ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pending Review</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Answered</span>
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400 font-mono">
                            {doubt.createdAt ? new Date(doubt.createdAt).toLocaleString() : ''}
                          </span>

                          {/* Delete button (Master Admin or Faculty) */}
                          <button
                            onClick={() => handleDeleteDoubt(doubt.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1"
                            title="Delete Doubt Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-4">
                        {/* Student Details & Question */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                              {doubt.studentName ? doubt.studentName[0] : 'S'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900">{doubt.studentName}</h4>
                                <span className="text-[11px] font-mono px-2 py-0.5 bg-white border border-slate-200 rounded text-blue-700 font-bold">
                                  ID: {doubt.studentId}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                <span>{doubt.classBatch || 'Class 11/12'}</span>
                                <span>•</span>
                                <span>Assigned to: <strong className="text-slate-800">{doubt.facultyName}</strong></span>
                                {doubt.facultyEmail && (
                                  <>
                                    <span>•</span>
                                    <span className="text-blue-700 font-mono text-[11px] flex items-center gap-0.5">
                                      <Mail className="w-3 h-3 text-blue-600" />
                                      {doubt.facultyEmail}
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Question Box */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Student Question / Doubt Description:
                          </label>
                          <div className="p-4 bg-amber-50/40 border border-amber-200/80 rounded-2xl text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                            "{doubt.question}"
                          </div>
                        </div>

                        {/* Existing Answer or Answering Box */}
                        {doubt.answer && !isAnsweringThis ? (
                          /* View Answered Solution */
                          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between text-xs text-emerald-900 border-b border-emerald-200/60 pb-2">
                              <span className="font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                <span>Faculty Solution by {doubt.answeredBy || doubt.facultyName}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-emerald-700 font-mono">
                                  {doubt.answeredAt ? new Date(doubt.answeredAt).toLocaleString() : ''}
                                </span>
                                <button
                                  onClick={() => handleStartAnswering(doubt)}
                                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-300 flex items-center gap-1 transition-colors"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Edit Solution</span>
                                </button>
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap pt-1 font-sans">
                              {doubt.answer}
                            </p>
                          </div>
                        ) : (
                          /* Answer Input Form */
                          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between text-xs text-blue-900">
                              <span className="font-bold flex items-center gap-1.5">
                                <Edit3 className="w-4 h-4 text-blue-700" />
                                <span>{doubt.answer ? 'Edit Teacher Solution:' : 'Write Solution for Student:'}</span>
                              </span>
                              <span className="text-[11px] text-slate-500">
                                This will show up instantly in the student's personal dashboard.
                              </span>
                            </div>

                            <textarea
                              rows={4}
                              placeholder="Type step-by-step solution, conceptual clarification, or formula hint..."
                              value={isAnsweringThis ? answerDraft : ''}
                              onFocus={() => {
                                if (!isAnsweringThis) handleStartAnswering(doubt);
                              }}
                              onChange={(e) => setAnswerDraft(e.target.value)}
                              className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
                            />

                            <div className="flex items-center justify-end gap-2">
                              {isAnsweringThis && (
                                <button
                                  type="button"
                                  onClick={handleCancelAnswering}
                                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                                >
                                  Cancel
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleAnswerSubmit(doubt.id)}
                                disabled={submittingAnswer || !answerDraft.trim() || (isAnsweringThis && answeringDoubtId !== doubt.id)}
                                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{submittingAnswer && answeringDoubtId === doubt.id ? 'Publishing...' : 'Publish Solution to Student'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* EMAIL NOTIFICATION SETTINGS & LIVE TEST MODAL */}
      {showEmailSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Email Notification Dispatcher</h3>
                  <p className="text-xs text-blue-200">
                    Connect outgoing mail server to deliver student doubts straight to faculty inboxes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailSettingsModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Connection Status Banner */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              {emailConfig.isConfigured ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-emerald-950 font-bold">Live Outgoing Mail Server Connected</strong>
                      <span className="px-2 py-0.2 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase">Active</span>
                    </div>
                    <p className="text-emerald-700 text-[11px] mt-0.5">
                      Sender Account: <strong className="font-mono">{emailConfig.smtpUser}</strong> (via {emailConfig.smtpHost})
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-amber-950 font-bold">Outgoing SMTP Not Configured Yet</strong>
                      <span className="px-2 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase">System Logging Mode</span>
                    </div>
                    <p className="text-amber-700 text-[11px] mt-0.5">
                      Student doubts are logged in the portal. Enter your Gmail and a 16-character Google App Password below to deliver real emails to faculty inboxes.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 px-6 pt-3 gap-2 bg-slate-50/50 text-xs font-bold">
              <button
                type="button"
                onClick={() => setEmailSettingsTab('settings')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
                  emailSettingsTab === 'settings'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>SMTP Configuration</span>
              </button>
              <button
                type="button"
                onClick={() => setEmailSettingsTab('test')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
                  emailSettingsTab === 'test'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Live Test Email</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailSettingsTab('logs');
                  loadEmailLogs();
                }}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
                  emailSettingsTab === 'logs'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Notification Logs ({emailLogs.length})</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
              {/* TAB 1: SMTP SETTINGS */}
              {emailSettingsTab === 'settings' && (
                <form onSubmit={handleSaveEmailConfig} className="space-y-4">
                  {emailSaveSuccess && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{emailSaveSuccess}</span>
                    </div>
                  )}

                  {emailSaveError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>{emailSaveError}</span>
                    </div>
                  )}

                  {/* Sender Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sender Email Address (e.g. Gmail or College Mail) *
                    </label>
                    <div className="relative">
                      <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="excellencia.portal@gmail.com"
                        value={emailConfig.smtpUser}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-700"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      The official sender mailbox used to dispatch notification emails.
                    </p>
                  </div>

                  {/* Google App Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Google 16-Character App Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowGoogleGuide(!showGoogleGuide)}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{showGoogleGuide ? 'Hide Instructions' : 'How to get Google App Password?'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showAppPassword ? 'text' : 'password'}
                        placeholder={emailConfig.hasPassword ? '•••••••••••••••• (Password Saved - leave blank to keep)' : '16-character Google App Password (e.g. abcd efgh ijkl mnop)'}
                        value={emailConfig.smtpPass}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpPass: e.target.value })}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAppPassword(!showAppPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showAppPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Google Setup Guide Accordion */}
                  {showGoogleGuide && (
                    <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2 text-xs text-blue-950">
                      <h4 className="font-bold flex items-center gap-1.5 text-blue-900">
                        <Sparkles className="w-4 h-4 text-blue-700" />
                        <span>3-Step Quick Setup for Gmail App Password:</span>
                      </h4>
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-700 text-[11px] pl-1">
                        <li>
                          Ensure <strong>2-Step Verification</strong> is ON for your Google Account.
                        </li>
                        <li>
                          Visit Google's App Passwords page:{' '}
                          <a
                            href="https://myaccount.google.com/apppasswords"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 font-bold underline inline-flex items-center gap-0.5"
                          >
                            <span>myaccount.google.com/apppasswords</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </li>
                        <li>
                          Type app name as <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900 font-mono">Excellencia Portal</code> and click <strong>Create</strong>.
                        </li>
                        <li>
                          Copy the <strong>16-letter code</strong> and paste it directly into the password box above!
                        </li>
                      </ol>
                    </div>
                  )}

                  {/* Sender Display Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sender Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="Excellencia Academic Portal"
                      value={emailConfig.smtpFrom}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpFrom: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-700"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      The name that appears in faculty inbox (e.g. "Excellencia Junior College").
                    </p>
                  </div>

                  {/* Advanced SMTP Host & Port */}
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        SMTP Host (Default: Gmail)
                      </label>
                      <input
                        type="text"
                        value={emailConfig.smtpHost}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={emailConfig.smtpPort}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: parseInt(e.target.value, 10) || 587 })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-700"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEmailSettingsModal(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingEmailConfig}
                      className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{savingEmailConfig ? 'Saving Settings...' : 'Save Email Settings'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: SEND LIVE TEST EMAIL */}
              {emailSettingsTab === 'test' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-950 space-y-1">
                    <h4 className="font-bold flex items-center gap-1.5 text-blue-900">
                      <Send className="w-4 h-4 text-blue-700" />
                      <span>Verify Live Email Dispatch</span>
                    </h4>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Enter your own email address to send a live test message and verify that the server connects to your mailbox.
                    </p>
                  </div>

                  <form onSubmit={handleSendTestEmail} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Recipient Test Email Address *
                      </label>
                      <div className="relative">
                        <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          placeholder="your.personal.email@gmail.com"
                          value={testRecipient}
                          onChange={(e) => setTestRecipient(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-700"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={sendingTestEmail || !testRecipient}
                      className="w-full py-3 bg-blue-900 hover:bg-blue-800 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {sendingTestEmail ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Dispatching Test Email to Mail Server...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Live Test Email Now</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Test Result Output */}
                  {testEmailResult && (
                    <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                      testEmailResult.success
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}>
                      <div className="flex items-start gap-2.5">
                        {testEmailResult.success ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h5 className="font-bold text-sm">
                            {testEmailResult.success ? 'Delivery Confirmed!' : 'Email Dispatch Failed'}
                          </h5>
                          <p className="mt-1">{testEmailResult.message}</p>
                          {!testEmailResult.success && (
                            <div className="mt-2 pt-2 border-t border-rose-200 text-[11px] text-rose-800 space-y-1">
                              <p><strong>Troubleshooting Tips:</strong></p>
                              <p>1. Make sure you are using a 16-character Google App Password (not your normal Gmail login password).</p>
                              <p>2. Verify that 2-Step Verification is active on your Google account.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: NOTIFICATION LOGS */}
              {emailSettingsTab === 'logs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Recent Email Notifications Activity</span>
                    <button
                      type="button"
                      onClick={loadEmailLogs}
                      disabled={loadingEmailLogs}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${loadingEmailLogs ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {loadingEmailLogs ? (
                    <div className="p-8 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-blue-600" />
                      <p className="text-xs">Loading email records...</p>
                    </div>
                  ) : emailLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                      <Mail className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                      <p className="text-xs font-bold text-slate-600">No Email Notifications Dispatched Yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">When students submit questions, every email dispatch will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
                      {emailLogs.map((log) => (
                        <div key={log.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900">
                              {log.recipientName} ({log.recipientEmail})
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              log.status === 'sent' ? 'bg-emerald-100 text-emerald-800' :
                              log.status === 'logged_ready_to_send' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {log.status === 'sent' ? 'Delivered' : log.status === 'logged_ready_to_send' ? 'Queued / Logged' : 'Failed'}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap">
                            <span>Student: <strong>{log.studentName}</strong> ({log.studentId})</span>
                            <span>•</span>
                            <span>Subject: <strong>{log.subject}</strong></span>
                            {log.topic && <span>({log.topic})</span>}
                          </div>

                          {log.note && (
                            <p className="text-[10px] text-amber-700 bg-amber-50/80 p-1.5 rounded-lg font-mono">
                              ℹ️ {log.note}
                            </p>
                          )}

                          {log.error && (
                            <p className="text-[10px] text-rose-700 bg-rose-50/80 p-1.5 rounded-lg font-mono">
                              ⚠️ {log.error}
                            </p>
                          )}

                          <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/60">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Encrypted Outgoing SMTP Connection</span>
              </span>
              <button
                type="button"
                onClick={() => setShowEmailSettingsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
