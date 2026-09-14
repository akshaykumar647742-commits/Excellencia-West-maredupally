import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

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
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'materials' | 'faculty' | 'students'
  
  // Faculty Authentication state
  const [facultyAuth, setFacultyAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('excellencia_faculty_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
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
        setFacultyMsg('Faculty WhatsApp contact saved successfully!');
        setNewFaculty({ name: '', subject: 'Mathematics', phone: '', designation: '', availableHours: '4:00 PM - 8:00 PM' });
        onFacultyUpdated();
      }
    } catch (err) {
      setFacultyMsg('Error saving faculty: ' + err.message);
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

  // Master Admin check (Restricted to Prof. Akshay)
  const isMasterAdmin = Boolean(
    facultyAuth?.id === 'FAC00' || 
    facultyAuth?.name?.toLowerCase().includes('akshay') || 
    facultyAuth?.isAdmin
  );

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
          <span>Faculty WhatsApp Contacts ({facultyList.length})</span>
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
                          href={m.fileUrl}
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
                      {f.name.replace('Prof. ', '').replace('Dr. ', '').replace('Mrs. ', '').replace('Mr. ', '')[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{f.name}</h4>
                      <p className="text-xs text-blue-700 font-medium">
                        {f.subject} • {f.designation || f.department}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Doubts Hours: {f.availableHours || '4:00 PM - 8:00 PM'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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
                  <p className="text-xs text-slate-500">Configure phone number for WhatsApp doubts.</p>
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
                  placeholder="e.g. Dr. Anirudh Sharma"
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

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Save Faculty Contact
              </button>
            </form>
          </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-50 to-amber-50/50 rounded-3xl p-6 border border-amber-200 shadow-sm text-center space-y-3 self-start">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900">Admin Editing Locked</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Only <strong>Prof. Akshay (Portal Administrator)</strong> has permission to modify faculty phone numbers and WhatsApp consultation channels.
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
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Registered Excellencia Student IDs ({students.length})
            </h3>
            <p className="text-xs text-slate-500">
              Students can log into the portal instantly using any of these Student ID numbers.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Student ID</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Batch & Stream</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{s.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{s.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {s.classBatch} • <span className="text-slate-500">{s.stream}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Add Student (Master Admin Only - Prof. Akshay) */}
          {isMasterAdmin ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Add New Student ID</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] uppercase border border-amber-300">
                  Admin Only
                </span>
              </div>
              {studentMsg && (
                <p className="text-xs p-2.5 bg-blue-50 text-blue-800 rounded-xl font-medium border border-blue-200">
                  {studentMsg}
                </p>
              )}
              <form onSubmit={handleAddStudent} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student ID *</label>
                  <input
                    type="text"
                    placeholder="e.g. EXM106"
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
                    placeholder="e.g. Rohan V"
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
                    placeholder="e.g. Class 12 - JEE Advanced"
                    value={newStudent.classBatch}
                    onChange={(e) => setNewStudent({ ...newStudent, classBatch: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stream</label>
                  <input
                    type="text"
                    placeholder="e.g. MPC"
                    value={newStudent.stream}
                    onChange={(e) => setNewStudent({ ...newStudent, stream: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Register Student ID
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-50 to-amber-50/50 rounded-3xl p-6 border border-amber-200 shadow-sm text-center space-y-3 self-start">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900">Admin Editing Locked</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Enrolling new student IDs and editing the student registry is strictly restricted to <strong>Prof. Akshay (Portal Administrator)</strong>.
              </p>
              <div className="pt-2 text-[11px] text-amber-800 font-bold">
                Logged in as Faculty Member (View Only)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
