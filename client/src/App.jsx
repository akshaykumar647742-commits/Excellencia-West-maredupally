import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MaterialsDashboard from './components/MaterialsDashboard';
import StudentLogin from './components/StudentLogin';
import FacultyPortal from './components/FacultyPortal';
import AskDoubtModal from './components/AskDoubtModal';
import ViewMaterialModal from './components/ViewMaterialModal';
import LoginRequiredModal from './components/LoginRequiredModal';
import { api } from './services/api';

export default function App() {
  const [student, setStudent] = useState(null);
  const [facultyAuth, setFacultyAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('excellencia_faculty_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#login') return 'login';
      if (window.location.hash === '#faculty') return 'faculty';
    }
    return 'materials';
  });
  const [materials, setMaterials] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  // Modals
  const [doubtModalOpen, setDoubtModalOpen] = useState(false);
  const [doubtMaterial, setDoubtMaterial] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState(null);

  // Login Required Modal state
  const [loginRequiredModalOpen, setLoginRequiredModalOpen] = useState(false);
  const [loginRequiredContext, setLoginRequiredContext] = useState({ material: null, action: 'access' });
  const [studentLoginReason, setStudentLoginReason] = useState('');

  const isAuthenticated = Boolean(student || facultyAuth);

  // Restore student & faculty sessions from localStorage
  useEffect(() => {
    try {
      const savedStudent = localStorage.getItem('excellencia_student');
      if (savedStudent) {
        setStudent(JSON.parse(savedStudent));
      }
      const savedFaculty = localStorage.getItem('excellencia_faculty_auth');
      if (savedFaculty) {
        setFacultyAuth(JSON.parse(savedFaculty));
      }
    } catch (e) {
      console.warn('Failed to parse saved auth sessions:', e);
    }

    const handleHashChange = () => {
      if (window.location.hash === '#login') setActiveView('login');
      else if (window.location.hash === '#faculty') setActiveView('faculty');
      else if (window.location.hash === '#materials' || window.location.hash === '') setActiveView('materials');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeView]);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoadingMaterials(true);
      const [matData, facData, stuData] = await Promise.all([
        api.getMaterials(),
        api.getFaculty(),
        api.getStudents()
      ]);
      setMaterials(Array.isArray(matData) ? matData : []);
      setFacultyList(Array.isArray(facData) ? facData : []);
      setStudents(Array.isArray(stuData) ? stuData : []);
    } catch (err) {
      console.error('Failed to load portal data:', err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLoginSuccess = (loggedInStudent) => {
    setStudent(loggedInStudent);
    localStorage.setItem('excellencia_student', JSON.stringify(loggedInStudent));
    setStudentLoginReason('');
    setActiveView('materials');
  };

  const handleLogout = () => {
    setStudent(null);
    setFacultyAuth(null);
    localStorage.removeItem('excellencia_student');
    localStorage.removeItem('excellencia_faculty_auth');
  };

  const handleRequireLogin = ({ material, action }) => {
    setLoginRequiredContext({ material, action });
    setLoginRequiredModalOpen(true);
  };

  const handleGoToStudentLogin = (targetMaterial = null) => {
    const mat = targetMaterial || loginRequiredContext.material;
    if (mat) {
      setStudentLoginReason(`Please log in with your Student ID to view or download "${mat.title}".`);
    } else {
      setStudentLoginReason('Please log in with your Student ID to access protected study materials.');
    }
    setLoginRequiredModalOpen(false);
    setActiveView('login');
  };

  const handleGoToFacultyLogin = () => {
    setLoginRequiredModalOpen(false);
    setActiveView('faculty');
  };

  const handleOpenDoubt = (material = null) => {
    setDoubtMaterial(material);
    setDoubtModalOpen(true);
  };

  const handlePreview = (material) => {
    if (!isAuthenticated) {
      handleRequireLogin({ material, action: 'view' });
      return;
    }
    setPreviewMaterial(material);
    setPreviewModalOpen(true);
  };

  const handleMaterialUploaded = (newMat) => {
    setMaterials(prev => [newMat, ...prev]);
  };

  const handleMaterialDeleted = (id) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-900 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        student={student}
        facultyAuth={facultyAuth}
        onLogout={handleLogout}
        onFacultyLogout={() => {
          setFacultyAuth(null);
          localStorage.removeItem('excellencia_faculty_auth');
        }}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenDoubtModal={() => handleOpenDoubt(null)}
        facultyCount={facultyList.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'login' && (
          <StudentLogin
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => {
              setStudentLoginReason('');
              setActiveView('materials');
            }}
            alertMessage={studentLoginReason}
          />
        )}

        {activeView === 'faculty' && (
          <FacultyPortal
            materials={materials}
            facultyList={facultyList}
            students={students}
            onMaterialUploaded={handleMaterialUploaded}
            onMaterialDeleted={handleMaterialDeleted}
            onFacultyUpdated={fetchData}
            onStudentAdded={fetchData}
            onBackToMaterials={() => setActiveView('materials')}
          />
        )}

        {activeView === 'materials' && (
          <MaterialsDashboard
            materials={materials}
            loading={loadingMaterials}
            student={student}
            facultyAuth={facultyAuth}
            isAuthenticated={isAuthenticated}
            onOpenDoubtModal={handleOpenDoubt}
            onPreviewMaterial={handlePreview}
            onRequireLogin={handleRequireLogin}
            onRefresh={fetchData}
            onGoToStudentLogin={handleGoToStudentLogin}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-bold text-slate-200">
              EXCELLENCIA JUNIOR COLLEGE — WEST MARREDPALLY
            </p>
            <p className="text-[11px] text-slate-500">
              Official Academic Learning Repository & Faculty Doubt Clearing System
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">Direct WhatsApp Doubt Routing</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">Class 11 & 12 • JEE & NEET</span>
          </div>
        </div>
      </footer>

      {/* Doubt Routing WhatsApp Modal */}
      <AskDoubtModal
        isOpen={doubtModalOpen}
        onClose={() => setDoubtModalOpen(false)}
        student={student}
        material={doubtMaterial}
        facultyList={facultyList}
      />

      {/* Document / Worksheet Preview Modal */}
      {previewModalOpen && (
        <ViewMaterialModal
          material={previewMaterial}
          student={student}
          facultyAuth={facultyAuth}
          onClose={() => setPreviewModalOpen(false)}
          onAskDoubt={handleOpenDoubt}
          onRequireLogin={handleRequireLogin}
        />
      )}

      {/* Login Required Prompt Modal */}
      <LoginRequiredModal
        isOpen={loginRequiredModalOpen}
        onClose={() => setLoginRequiredModalOpen(false)}
        material={loginRequiredContext.material}
        action={loginRequiredContext.action}
        onGoToStudentLogin={handleGoToStudentLogin}
        onGoToFacultyLogin={handleGoToFacultyLogin}
      />
    </div>
  );
}
