import os
import json

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "materials.json")

def create_sample_pdf(filepath, title, subject, faculty):
    # Generates a clean, valid PDF 1.4 document
    title_escaped = title.replace("(", "[").replace(")", "]")
    subject_escaped = subject.replace("(", "[").replace(")", "]")
    faculty_escaped = faculty.replace("(", "[").replace(")", "]")

    content_stream = f"""BT
/F1 22 Tf
50 720 Td
(EXCELLENCIA JUNIOR COLLEGE - WEST MARREDPALLY) Tj
/F1 14 Tf
0 -30 Td
(Subject: {subject_escaped} | Faculty: {faculty_escaped}) Tj
/F1 16 Tf
0 -40 Td
(Topic: {title_escaped}) Tj
/F1 12 Tf
0 -35 Td
(================================================================) Tj
0 -25 Td
(Welcome to Excellencia Digital Study Material & Worksheet Hub.) Tj
0 -20 Td
(Solve all problems systematically in your practice notebook.) Tj
0 -20 Td
(For any doubts, use the Ask Doubt WhatsApp button on the portal.) Tj
0 -20 Td
(Your doubt will be sent directly to your faculty on WhatsApp.) Tj
0 -30 Td
(Practice Problems:) Tj
0 -20 Td
(1. Solve with step-by-step reasoning and state all underlying formulas.) Tj
0 -20 Td
(2. Check time taken per question (aim for 2.5 minutes per MCQ).) Tj
0 -20 Td
(3. Highlight challenging questions to discuss in doubt clearing hours.) Tj
0 -35 Td
(Best of luck from the Excellencia Faculty Team!) Tj
ET"""

    stream_len = len(content_stream.encode('utf-8'))

    pdf = f"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length {stream_len} >>
stream
{content_stream}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000228 00000 n 
0000000000 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
500
%%EOF
"""
    with open(filepath, "wb") as f:
        f.write(pdf.encode("latin-1"))

with open(DATA_FILE, "r", encoding="utf-8") as f:
    materials = json.load(f)

for m in materials:
    filename = m["fileName"]
    path = os.path.join(UPLOAD_DIR, filename)
    create_sample_pdf(path, m["title"], m["subject"], m["facultyName"])
    print(f"Generated sample PDF: {filename}")

print("All sample PDFs created successfully.")
