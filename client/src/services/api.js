const API_BASE = '/api';

export const api = {
  // Students
  getStudents: async () => {
    const res = await fetch(`${API_BASE}/students`);
    return res.json();
  },

  loginStudent: async (studentId) => {
    const res = await fetch(`${API_BASE}/students/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId })
    });
    return res.json();
  },

  registerStudent: async (studentData) => {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    return res.json();
  },

  bulkUploadStudents: async (formData) => {
    const res = await fetch(`${API_BASE}/students/bulk-upload`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  // Faculty
  loginFaculty: async (passcode, facultyId) => {
    const res = await fetch(`${API_BASE}/faculty/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode, facultyId })
    });
    return res.json();
  },

  getFaculty: async () => {
    const res = await fetch(`${API_BASE}/faculty`);
    return res.json();
  },

  saveFaculty: async (facultyData) => {
    const res = await fetch(`${API_BASE}/faculty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facultyData)
    });
    return res.json();
  },

  deleteFaculty: async (id) => {
    const res = await fetch(`${API_BASE}/faculty/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Materials
  getMaterials: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.subject && params.subject !== 'All') query.append('subject', params.subject);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.classBatch && params.classBatch !== 'All') query.append('classBatch', params.classBatch);
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/materials?${query.toString()}`);
    return res.json();
  },

  uploadMaterial: async (formData) => {
    const res = await fetch(`${API_BASE}/materials/upload`, {
      method: 'POST',
      body: formData // multer multipart
    });
    return res.json();
  },

  deleteMaterial: async (id) => {
    const res = await fetch(`${API_BASE}/materials/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Doubt logging
  logDoubt: async (doubtData) => {
    const res = await fetch(`${API_BASE}/doubts/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doubtData)
    });
    return res.json();
  }
};
