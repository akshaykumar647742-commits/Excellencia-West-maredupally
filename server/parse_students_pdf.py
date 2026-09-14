import pypdf
import re
import json

def parse_students():
    found_students = []
    seen = set()

    # 1. Parse Excellencia_3IPE_Marks_with_Phone_260808_171603.pdf
    pdf1 = r"C:\Users\Admin\Documents\Excellencia_3IPE_Marks_with_Phone_260808_171603.pdf"
    try:
        reader = pypdf.PdfReader(pdf1)
        full_text = "\n".join([page.extract_text() for page in reader.pages])
        lines = [line.strip() for line in full_text.split("\n") if line.strip()]
        
        for i, line in enumerate(lines):
            if re.match(r"^\d{6}$", line):
                sid = line
                sname = lines[i+1] if i+1 < len(lines) else "Student"
                phone = ""
                for j in range(i+2, min(i+6, len(lines))):
                    m = re.search(r"(\b[6-9]\d{9}\b)", lines[j])
                    if m:
                        phone = m.group(1)
                        break
                if sid not in seen and not sname.isdigit() and len(sname) > 2:
                    seen.add(sid)
                    found_students.append({
                        "id": sid,
                        "name": sname,
                        "classBatch": "Class 12 - Senior Sankalp 3 (MPC)",
                        "stream": "MPC",
                        "phone": phone,
                        "rollNo": sid
                    })
    except Exception as e:
        print("Error parsing pdf1:", e)

    # 2. Parse ipe s2mk.pdf
    pdf2 = r"C:\Users\Admin\Documents\ipe s2mk.pdf"
    try:
        reader2 = pypdf.PdfReader(pdf2)
        text2 = "\n".join([page.extract_text() for page in reader2.pages])
        for line in text2.split("\n"):
            # Format: 925003 K.VIGNESHWARAN 9989608928 19 20
            match = re.match(r"^(\d{6})\s+([A-Za-z\.\s]+?)\s+([6-9]\d{9})", line.strip())
            if match:
                sid, sname, phone = match.group(1), match.group(2).strip(), match.group(3)
                if sid not in seen:
                    seen.add(sid)
                    found_students.append({
                        "id": sid,
                        "name": sname,
                        "classBatch": "Class 12 - Senior Sankalp 2 (MPC)",
                        "stream": "MPC",
                        "phone": phone,
                        "rollNo": sid
                    })
    except Exception as e:
        print("Error parsing pdf2:", e)

    print(f"Total Unique Students Extracted: {len(found_students)}")
    return found_students

if __name__ == "__main__":
    stus = parse_students()
    print("Sample 15 students:")
    for s in stus[:15]:
        print(f"  ID: {s['id']} | Name: {s['name']} | Phone: {s['phone']} | Batch: {s['classBatch']}")
