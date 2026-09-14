# Excellencia Student & Faculty Academic Portal (West Marredpally)

A complete web platform built for **Excellencia Junior College (West Marredpally)** students and faculty.

---

## 🌟 Key Features

1. **Student Login by ID Number**:
   - Students login using their ID number (e.g. `EXM101`, `EXM102`, `EXM103`, etc.).
   - Instant authentication showing student's name, class, and enrolled batch (MPC, BiPC, JEE, NEET).
   - Ability to self-enroll or add new student roll numbers.

2. **Worksheets & Materials at One Glance**:
   - Organized repository categorized by **Subject** (Mathematics, Physics, Chemistry, Biology, English).
   - Filter by **Type** (Worksheets, Daily Practice Problems / DPP, Lecture Notes, Formula Sheets, Previous Year Papers / PYQ).
   - Filter by **Class/Batch** (Class 11, Class 12, JEE, NEET, IPE).
   - Real-time instant search bar for chapters and topics.
   - One-click **"View Worksheet"** (in-app preview) and **"Download PDF"**.

3. **Direct Faculty WhatsApp Doubt Clearing**:
   - Students can click **"Ask Doubt on this Worksheet"** on any material card or the global **"Ask Doubt on WhatsApp"** button.
   - Student selects or verifies the faculty member teaching that subject.
   - The platform auto-generates a clean, professional WhatsApp message containing:
     - Student Name & ID Number
     - Class & Batch
     - Subject & Faculty Name
     - Worksheet / Chapter reference
     - Student's question / doubt details
   - Clicking **"Open WhatsApp & Send to Faculty"** automatically launches WhatsApp directly into that teacher's chat.

4. **Faculty Upload & Management Portal**:
   - Faculty can upload PDFs, worksheets, DPPs, and formula sheets directly from their computer or via Google Drive links.
   - Faculty can update their subject specializations, WhatsApp phone numbers, and doubt-clearing hours.
   - View and manage student ID directory.

---

## 🚀 How to Run the Website

### Option 1: Start the Full Website (Single Command)
From the project root:
```bash
npm start
```
Then open your browser at:
👉 **`http://localhost:5000`**

---

### Option 2: Run in Development Mode (Live Reload for Client & Server)
```bash
npm run dev
```
- Frontend dev server: `http://localhost:3000`
- Backend API server: `http://localhost:5000`

---

## 👥 Demo Student IDs for Quick Testing

| Student ID | Student Name | Class / Batch | Stream |
|------------|--------------|---------------|--------|
| `EXM101` | Aarav Sharma | Class 11 - JEE Batch A | MPC |
| `EXM102` | Ananya Reddy | Class 12 - NEET Medical | BiPC |
| `EXM103` | Sai Krishna | Class 12 - JEE Advanced | MPC |
| `EXM104` | Rhea Verghese | Class 11 - IPE + NEET | BiPC |
| `EXM105` | Karthik Varma | Class 11 - JEE Foundation | MPC |

*(You can also register any new student ID directly from the login page or faculty portal!)*

---

## 👨‍🏫 Default Faculty Directory & WhatsApp Numbers

| Subject | Faculty Name | Designation | WhatsApp Phone | Available Hours |
|---------|--------------|-------------|----------------|-----------------|
| **Mathematics** | Prof. K. Venkatesh Rao | Senior HOD - Mathematics | `+91 9848012345` | 4:00 PM - 8:30 PM |
| **Physics** | Dr. Ramesh Chander | Senior Faculty - Physics | `+91 9849123456` | 5:00 PM - 9:00 PM |
| **Chemistry** | Mrs. Sunita Sharma | HOD - Chemistry (NEET/JEE) | `+91 9849234567` | 3:30 PM - 7:30 PM |
| **Biology** | Dr. Shalini Prasad | Senior Faculty - Biology | `+91 9849345678` | 4:30 PM - 8:30 PM |
| **English** | Mr. Joseph Anthony | Faculty - English & Soft Skills | `+91 9849456789` | 2:00 PM - 6:00 PM |

*(Faculty can update their phone numbers and add more teachers anytime under the **Faculty Portal** tab.)*

---

## 📁 Project Structure

```
excellencia-westmaredupally/
├── package.json              # Root scripts and server dependencies
├── server/
│   ├── index.js              # Express API (Auth, Uploads, Faculty, Doubts)
│   ├── data/
│   │   ├── materials.json    # Worksheets, DPPs, and notes catalog
│   │   ├── faculty.json      # Faculty contacts & WhatsApp numbers
│   │   ├── students.json     # Student ID registry
│   │   └── doubts_log.json   # Recorded doubt queries
│   └── uploads/              # Uploaded PDF worksheets and files
├── client/
│   ├── index.html            # Excellencia branding & web font
│   ├── vite.config.js        # Vite + Tailwind + Proxy configuration
│   └── src/
│       ├── App.jsx           # Main portal application
│       ├── components/
│       │   ├── Navbar.jsx               # Header, student badge & WhatsApp button
│       │   ├── StudentLogin.jsx         # ID login & quick demo student pills
│       │   ├── MaterialsDashboard.jsx   # At a glance worksheets & search
│       │   ├── MaterialCard.jsx         # Subject cards with preview & WhatsApp
│       │   ├── AskDoubtModal.jsx        # Direct WhatsApp doubt routing
│       │   ├── FacultyPortal.jsx        # Material uploads & faculty management
│       │   └── ViewMaterialModal.jsx    # In-app document preview
│       └── services/
│           └── api.js        # API service client
```
