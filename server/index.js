const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Directories
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper functions for reading and writing data
const readJSON = (filename, fallback = []) => {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
      return fallback;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return fallback;
  }
};

const writeJSON = (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
    return false;
  }
};

// Multer storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Sanitize filename and prepend timestamp
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, `${uniqueSuffix}-${safeName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
});

// Format file size
const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/* ============================================================
   STUDENT ROUTES
============================================================ */

// Get all registered students
app.get('/api/students', (req, res) => {
  const students = readJSON('students.json', []);
  res.json(students);
});

// Student Login by ID number
app.post('/api/students/login', (req, res) => {
  const { studentId } = req.body;
  if (!studentId || !studentId.trim()) {
    return res.status(400).json({ success: false, message: 'Please provide a valid Student ID' });
  }

  const cleanId = studentId.trim().toUpperCase();
  const students = readJSON('students.json', []);
  const student = students.find(s => s.id.toUpperCase() === cleanId || (s.rollNo && s.rollNo.toUpperCase() === cleanId));

  if (!student) {
    return res.status(404).json({
      success: false,
      message: `Student ID "${studentId}" not found. Please verify with Excellencia Admin.`
    });
  }

  return res.json({
    success: true,
    message: `Welcome back, ${student.name}!`,
    student
  });
});

// Register or quick add new Student ID
app.post('/api/students', (req, res) => {
  const { id, name, classBatch, stream, phone, rollNo } = req.body;
  if (!id || !name) {
    return res.status(400).json({ success: false, message: 'Student ID and Name are required' });
  }

  const cleanId = id.trim().toUpperCase();
  const students = readJSON('students.json', []);

  if (students.some(s => s.id.toUpperCase() === cleanId)) {
    return res.status(400).json({ success: false, message: `Student ID ${cleanId} already exists` });
  }

  const newStudent = {
    id: cleanId,
    name: name.trim(),
    classBatch: classBatch || 'Class 11 - General',
    stream: stream || 'MPC',
    phone: phone || '',
    rollNo: rollNo || cleanId,
    joinDate: new Date().toISOString().split('T')[0]
  };

  students.push(newStudent);
  writeJSON('students.json', students);

  res.status(201).json({ success: true, student: newStudent });
});

/* ============================================================
   FACULTY ROUTES
============================================================ */

// Get all faculty with subjects & WhatsApp numbers
app.get('/api/faculty', (req, res) => {
  const faculty = readJSON('faculty.json', []);
  res.json(faculty);
});

// Add or update faculty
app.post('/api/faculty', (req, res) => {
  const { id, name, subject, department, phone, email, designation, availableHours, bio } = req.body;
  if (!name || !subject || !phone) {
    return res.status(400).json({ success: false, message: 'Name, subject, and WhatsApp phone number are required' });
  }

  // Clean phone number (keep digits only)
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const facultyList = readJSON('faculty.json', []);
  const existingIndex = facultyList.findIndex(f => f.id === id);

  if (existingIndex >= 0) {
    // Update existing
    facultyList[existingIndex] = {
      ...facultyList[existingIndex],
      name,
      subject,
      department: department || facultyList[existingIndex].department,
      phone: cleanPhone,
      email: email || facultyList[existingIndex].email,
      designation: designation || facultyList[existingIndex].designation,
      availableHours: availableHours || facultyList[existingIndex].availableHours,
      bio: bio || facultyList[existingIndex].bio
    };
    writeJSON('faculty.json', facultyList);
    return res.json({ success: true, faculty: facultyList[existingIndex] });
  } else {
    // Create new
    const newFaculty = {
      id: id || `FAC${Date.now().toString().slice(-4)}`,
      name,
      subject,
      department: department || `${subject} Department`,
      phone: cleanPhone,
      email: email || '',
      designation: designation || `Faculty - ${subject}`,
      availableHours: availableHours || '4:00 PM - 8:00 PM',
      bio: bio || ''
    };
    facultyList.push(newFaculty);
    writeJSON('faculty.json', facultyList);
    return res.status(201).json({ success: true, faculty: newFaculty });
  }
});

// Delete faculty
app.delete('/api/faculty/:id', (req, res) => {
  const { id } = req.params;
  let facultyList = readJSON('faculty.json', []);
  facultyList = facultyList.filter(f => f.id !== id);
  writeJSON('faculty.json', facultyList);
  res.json({ success: true, message: 'Faculty removed successfully' });
});

// Faculty Passcode Authentication (Teachers Login)
app.post('/api/faculty/login', (req, res) => {
  const { passcode, facultyId } = req.body;
  const EXPECTED_PASSCODE = process.env.FACULTY_PASSCODE || 'excellencia2026';

  if (!passcode || passcode.trim() !== EXPECTED_PASSCODE) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Faculty Passcode. (Default demo passcode is excellencia2026)'
    });
  }

  const facultyList = readJSON('faculty.json', []);
  const teacher = facultyList.find(f => f.id === facultyId) || (facultyId ? { id: facultyId, name: 'Excellencia Faculty' } : facultyList[0]);

  return res.json({
    success: true,
    message: `Faculty authentication successful! Welcome, ${teacher?.name || 'Teacher'}.`,
    faculty: teacher,
    allFaculty: facultyList
  });
});


/* ============================================================
   MATERIALS & WORKSHEETS ROUTES
============================================================ */

// Get materials with search, subject, and category filtering
app.get('/api/materials', (req, res) => {
  const { subject, category, classBatch, search } = req.query;
  let materials = readJSON('materials.json', []);

  if (subject && subject !== 'All') {
    materials = materials.filter(m => m.subject.toLowerCase() === subject.toLowerCase());
  }

  if (category && category !== 'All') {
    materials = materials.filter(m => m.category.toLowerCase() === category.toLowerCase());
  }

  if (classBatch && classBatch !== 'All') {
    materials = materials.filter(m => m.classBatch.toLowerCase().includes(classBatch.toLowerCase()));
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    materials = materials.filter(m => 
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      (m.tags && m.tags.some(t => t.toLowerCase().includes(q))) ||
      m.facultyName.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q)
    );
  }

  // Return newest first
  materials.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  res.json(materials);
});

// Upload new material / worksheet
app.post('/api/materials/upload', upload.single('file'), (req, res) => {
  try {
    const {
      title,
      subject,
      category,
      classBatch,
      description,
      facultyName,
      facultyId,
      externalUrl,
      totalQuestions,
      hasSolutions,
      tags
    } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ success: false, message: 'Title and Subject are required' });
    }

    let fileName = '';
    let fileUrl = '';
    let fileSize = '';

    if (req.file) {
      fileName = req.file.originalname;
      fileUrl = `/uploads/${req.file.filename}`;
      fileSize = formatBytes(req.file.size);
    } else if (externalUrl) {
      fileName = 'External Resource / Drive Link';
      fileUrl = externalUrl;
      fileSize = 'Cloud Link';
    } else {
      return res.status(400).json({ success: false, message: 'Please attach a document or provide an external drive link' });
    }

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags;
      } catch (e) {
        parsedTags = [subject];
      }
    } else {
      parsedTags = [subject, category || 'Material'];
    }

    const newMaterial = {
      id: `mat-${Date.now()}`,
      title: title.trim(),
      subject: subject.trim(),
      category: category || 'Worksheet',
      classBatch: classBatch || 'All Batches',
      description: description || '',
      facultyName: facultyName || 'Excellencia Faculty',
      facultyId: facultyId || '',
      fileName,
      fileUrl,
      fileSize,
      uploadDate: new Date().toISOString().split('T')[0],
      totalQuestions: totalQuestions ? parseInt(totalQuestions, 10) : 0,
      hasSolutions: hasSolutions === 'true' || hasSolutions === true,
      tags: parsedTags
    };

    const materials = readJSON('materials.json', []);
    materials.unshift(newMaterial);
    writeJSON('materials.json', materials);

    res.status(201).json({ success: true, material: newMaterial });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload material: ' + err.message });
  }
});

// Delete material
app.delete('/api/materials/:id', (req, res) => {
  const { id } = req.params;
  let materials = readJSON('materials.json', []);
  const target = materials.find(m => m.id === id);

  if (target && target.fileUrl && target.fileUrl.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, target.fileUrl);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not delete file:', filePath);
      }
    }
  }

  materials = materials.filter(m => m.id !== id);
  writeJSON('materials.json', materials);
  res.json({ success: true, message: 'Material deleted successfully' });
});

/* ============================================================
   DOUBTS & INQUIRIES LOGGING
============================================================ */

app.post('/api/doubts/log', (req, res) => {
  const { studentId, studentName, facultyId, facultyName, subject, topic, question } = req.body;
  const doubts = readJSON('doubts_log.json', []);

  const newLog = {
    id: `doubt-${Date.now()}`,
    studentId: studentId || 'Anonymous',
    studentName: studentName || 'Student',
    facultyId,
    facultyName,
    subject,
    topic,
    question,
    timestamp: new Date().toISOString()
  };

  doubts.unshift(newLog);
  writeJSON('doubts_log.json', doubts.slice(0, 500)); // keep last 500
  res.json({ success: true });
});

// Serve frontend in production build if present
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Excellencia Server running on port ${PORT}`);
});

