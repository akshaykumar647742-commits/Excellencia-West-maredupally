const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable browser caching for index and API to ensure immediate live updates
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Directories
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}


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

/* ============================================================
   PROTECTED STUDY MATERIALS & WORKSHEETS DOWNLOADS / VIEWS
   Requires Student ID or Faculty Authentication
============================================================ */
app.use('/uploads', (req, res, next) => {
  const studentId = req.query.studentId || req.headers['x-student-id'];
  const facultyId = req.query.facultyId || req.headers['x-faculty-id'];
  const auth = req.query.auth || req.headers['authorization'];
  const passcode = req.query.passcode;
  const EXPECTED_PASSCODE = process.env.FACULTY_PASSCODE || 'excellencia2026';

  let isAuthorized = false;

  // 1. Verify Student Authentication
  if (studentId) {
    const students = readJSON('students.json', []);
    const cleanId = String(studentId).trim().toUpperCase();
    if (students.some(s => s.id.toUpperCase() === cleanId || (s.rollNo && s.rollNo.toUpperCase() === cleanId))) {
      isAuthorized = true;
    }
  }

  // 2. Verify Faculty Authentication
  if (!isAuthorized && (facultyId || auth === 'faculty' || passcode)) {
    if (passcode === EXPECTED_PASSCODE || auth === 'faculty') {
      isAuthorized = true;
    } else if (facultyId) {
      const faculty = readJSON('faculty.json', []);
      if (faculty.some(f => f.id === facultyId)) {
        isAuthorized = true;
      }
    }
  }

  // 3. Fallback: Check token or Bearer header
  if (!isAuthorized && auth) {
    const cleanAuth = String(auth).replace('Bearer ', '').trim();
    if (cleanAuth === EXPECTED_PASSCODE || cleanAuth === 'faculty' || cleanAuth.startsWith('EXM')) {
      isAuthorized = true;
    }
  }

  if (isAuthorized) {
    return next();
  }

  // Unauthorized: Return 403 with prompt to login
  res.status(403);
  if (req.accepts('html') && !req.xhr && !req.path.endsWith('.json')) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Login Required | Excellencia West Marredpally</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { background: #1e293b; border: 1px solid #334155; border-radius: 24px; padding: 40px; max-width: 480px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
          .icon { width: 64px; height: 64px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 30px; margin-bottom: 20px; }
          h2 { margin: 0 0 10px; font-size: 22px; font-weight: 800; color: #fff; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
          .badge { display: inline-block; padding: 4px 12px; background: #1e3a8a; color: #93c5fd; border-radius: 8px; font-size: 12px; font-weight: 700; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
          .btn { display: inline-block; width: 100%; padding: 14px 20px; background: #2563eb; color: #fff; text-decoration: none; font-weight: 700; border-radius: 14px; box-sizing: border-box; font-size: 15px; margin-bottom: 12px; transition: background 0.2s; }
          .btn:hover { background: #1d4ed8; }
          .btn-secondary { background: #334155; color: #e2e8f0; }
          .btn-secondary:hover { background: #475569; }
          .footer { margin-top: 24px; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🔒</div>
          <div class="badge">West Marredpally Campus</div>
          <h2>Login Required</h2>
          <p>This worksheet is an exclusive academic resource for students and teachers of Excellencia Junior College. Please log in to view or download.</p>
          <a class="btn" href="/#login">Log in with Student ID</a>
          <a class="btn btn-secondary" href="/#faculty">Faculty Portal</a>
          <div class="footer">Excellencia Academic Repository & Faculty Doubt System</div>
        </div>
      </body>
      </html>
    `);
  }

  return res.json({
    success: false,
    error: 'AUTHENTICATION_REQUIRED',
    message: 'Access Denied: Please log in with your Student ID or Faculty account to view or download this study material.'
  });
});

// Serve uploaded files once authorized
app.use('/uploads', express.static(UPLOADS_DIR));

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

// Download sample Excel template for bulk student upload
app.get('/api/students/sample-template', (req, res) => {
  const sampleData = [
    {
      'Student ID': '925001',
      'Student Name': 'Rahul Reddy',
      'Class Batch': 'Class 12 - Senior Sankalp (MPC)',
      'Stream': 'MPC',
      'Parent Phone': '9848012345'
    },
    {
      'Student ID': '925002',
      'Student Name': 'Ananya Rao',
      'Class Batch': 'Class 11 - NEET Medical (BiPC)',
      'Stream': 'BiPC',
      'Parent Phone': '9849123456'
    },
    {
      'Student ID': '925003',
      'Student Name': 'K. Vigneshwaran',
      'Class Batch': 'Class 12 - JEE Advanced (MPC)',
      'Stream': 'MPC',
      'Parent Phone': '9989608928'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students_Template');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename="Excellencia_Student_Upload_Template.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

// Bulk Upload Students via Excel (.xlsx, .xls) or CSV
app.post('/api/students/bulk-upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an Excel (.xlsx, .xls) or CSV file' });
  }

  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, message: 'The uploaded sheet contains no data rows.' });
    }

    const students = readJSON('students.json', []);
    let addedCount = 0;
    let updatedCount = 0;
    const importedList = [];

    rawRows.forEach((row) => {
      const getVal = (possibleKeys) => {
        for (const k of Object.keys(row)) {
          const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          for (const pk of possibleKeys) {
            if (cleanK === pk || cleanK.includes(pk)) {
              return String(row[k]).trim();
            }
          }
        }
        return '';
      };

      const id = getVal(['studentid', 'idno', 'rollno', 'id', 'roll', 'htno', 'hallticket']);
      const name = getVal(['studentname', 'fullname', 'name', 'candidate']);
      const classBatch = getVal(['classbatch', 'class', 'batch', 'section', 'course']) || 'Class 12 - Senior Sankalp (MPC)';
      const stream = getVal(['stream', 'group', 'branch']) || 'MPC';
      const phone = getVal(['parentphone', 'phone', 'mobile', 'contact', 'cell', 'fathermobile', 'mothermobile']) || '';

      if (id && name) {
        const cleanId = id.toUpperCase();
        const existingIdx = students.findIndex(s => s.id.toUpperCase() === cleanId);
        const studentObj = {
          id: cleanId,
          name,
          classBatch,
          stream,
          phone,
          rollNo: cleanId,
          joinDate: new Date().toISOString().split('T')[0]
        };

        if (existingIdx >= 0) {
          students[existingIdx] = { ...students[existingIdx], ...studentObj };
          updatedCount++;
        } else {
          students.push(studentObj);
          addedCount++;
        }
        importedList.push(studentObj);
      }
    });

    writeJSON('students.json', students);

    // Delete temp file
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (e) {
      console.warn('Could not delete temp uploaded excel file:', e);
    }

    if (importedList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not find columns like "Student ID" and "Student Name" in your sheet. Please check the template.'
      });
    }

    return res.json({
      success: true,
      count: importedList.length,
      addedCount,
      updatedCount,
      message: `Successfully processed ${importedList.length} students (${addedCount} newly enrolled, ${updatedCount} updated)!`
    });
  } catch (err) {
    console.error('Error processing Excel file:', err);
    res.status(500).json({ success: false, message: 'Failed to parse Excel file: ' + err.message });
  }
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

