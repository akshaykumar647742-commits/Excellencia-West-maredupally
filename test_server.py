import urllib.request
import urllib.error
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def run_tests():
    print("--- 1. Testing Homepage HTML (React App) ---")
    with urllib.request.urlopen('http://localhost:5000/') as res:
        html = res.read().decode('utf-8')
        assert '<div id="root">' in html
        print("✓ Homepage successfully served React bundle.")

    print("\n--- 2. Testing Materials API ---")
    with urllib.request.urlopen('http://localhost:5000/api/materials') as res:
        materials = json.loads(res.read().decode('utf-8'))
        assert len(materials) >= 9
        print(f"✓ Retrieved {len(materials)} study materials/worksheets.")
        sample = materials[0]
        print(f"  Sample: [{sample['subject']}] {sample['title']} by {sample['facultyName']}")

    print("\n--- 3. Testing Faculty API ---")
    with urllib.request.urlopen('http://localhost:5000/api/faculty') as res:
        faculty = json.loads(res.read().decode('utf-8'))
        assert len(faculty) >= 5
        print(f"✓ Retrieved {len(faculty)} faculty members.")
        for f in faculty:
            print(f"  • {f['name']} ({f['subject']}) - WhatsApp: +{f['phone']}")

    print("\n--- 4. Testing Student Login API ---")
    req = urllib.request.Request(
        'http://localhost:5000/api/students/login',
        data=json.dumps({'studentId': 'EXM101'}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        login_res = json.loads(res.read().decode('utf-8'))
        assert login_res['success'] is True
        student = login_res['student']
        print(f"✓ Student Login Success: {student['name']} (ID: {student['id']}, {student['classBatch']})")

    print("\n--- 5. Testing PDF Worksheet Protection (Unauthenticated 403 vs Authenticated 200) ---")
    # 5a. Unauthenticated attempt must be blocked with HTTP 403
    unauth_blocked = False
    try:
        urllib.request.urlopen('http://localhost:5000/uploads/Maths_Class12_Definite_Integrals_Worksheet.pdf')
    except urllib.error.HTTPError as e:
        if e.code == 403:
            unauth_blocked = True
            print(f"✓ Unauthenticated download properly blocked with HTTP 403 Forbidden.")
        else:
            raise
    assert unauth_blocked, "Expected unauthenticated PDF request to be rejected with 403 Forbidden!"

    # 5b. Authenticated student access succeeds with HTTP 200
    with urllib.request.urlopen('http://localhost:5000/uploads/Maths_Class12_Definite_Integrals_Worksheet.pdf?studentId=EXM101') as res:
        assert res.status == 200
        content = res.read()
        assert len(content) > 100
        print(f"✓ Authenticated student access succeeded with status {res.status} ({len(content)} bytes).")

    # 5c. Authenticated faculty access succeeds with HTTP 200
    with urllib.request.urlopen('http://localhost:5000/uploads/Maths_Class12_Definite_Integrals_Worksheet.pdf?facultyId=FAC00&auth=faculty') as res:
        assert res.status == 200
        content = res.read()
        assert len(content) > 100
        print(f"✓ Authenticated faculty access succeeded with status {res.status} ({len(content)} bytes).")

    print("\n--- 6. Testing WhatsApp Doubt Logging API ---")
    doubt_payload = {
        'studentId': 'EXM101',
        'studentName': 'Aarav Sharma',
        'facultyId': 'FAC01',
        'facultyName': 'Prof. K. Venkatesh Rao',
        'subject': 'Mathematics',
        'topic': 'Definite Integrals',
        'question': 'How do we use Leibniz rule when the upper limit is x^2?'
    }
    req2 = urllib.request.Request(
        'http://localhost:5000/api/doubts/log',
        data=json.dumps(doubt_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req2) as res:
        doubt_res = json.loads(res.read().decode('utf-8'))
        assert doubt_res['success'] is True
        print("✓ Doubt inquiry logged successfully.")

    print("\n--- 7. Testing Faculty Material Upload (Multipart/Form-Data) ---")
    import uuid
    boundary = '----Boundary' + uuid.uuid4().hex
    crlf = b'\r\n'
    body_bytes = bytearray()
    
    def add_f(name, val):
        body_bytes.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{val}\r\n'.encode('utf-8'))
        
    def add_b(name, filename, content):
        body_bytes.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"; filename="{filename}"\r\nContent-Type: application/pdf\r\n\r\n'.encode('utf-8'))
        body_bytes.extend(content)
        body_bytes.extend(b'\r\n')

    add_f('title', 'Optics Wave Theory Master Practice Sheet')
    add_f('subject', 'Physics')
    add_f('category', 'Worksheet')
    add_f('classBatch', 'Class 12 - JEE Advanced')
    add_f('facultyName', 'Dr. Ramesh Chander')
    add_f('facultyId', 'FAC02')
    add_f('description', 'Interference, diffraction, and polarization practice problems.')
    add_f('totalQuestions', '20')
    add_f('hasSolutions', 'true')
    add_b('file', 'Physics_Wave_Optics_Practice.pdf', b'%PDF-1.4 sample content for automated test')
    body_bytes.extend(f'--{boundary}--\r\n'.encode('utf-8'))
    
    upload_req = urllib.request.Request(
        'http://localhost:5000/api/materials/upload',
        data=bytes(body_bytes),
        headers={
            'Content-Type': f'multipart/form-data; boundary={boundary}',
            'Content-Length': str(len(body_bytes))
        }
    )
    with urllib.request.urlopen(upload_req) as res:
        up_data = json.loads(res.read().decode('utf-8'))
        print(f"✓ Faculty uploaded new worksheet: '{up_data['material']['title']}' (ID: {up_data['material']['id']})")
        print(f"  File URL: {up_data['material']['fileUrl']}")

    # Clean up test uploaded worksheet so materials list stays clean
    del_test_req = urllib.request.Request(
        f"http://localhost:5000/api/materials/{up_data['material']['id']}",
        method='DELETE'
    )
    with urllib.request.urlopen(del_test_req) as res:
        print(f"✓ Cleaned up test uploaded worksheet ({up_data['material']['id']}).")

    print("\n--- 8. Testing Faculty Login API (Passcode Authentication) ---")
    # Correct passcode
    req_fac = urllib.request.Request(
        'http://localhost:5000/api/faculty/login',
        data=json.dumps({'passcode': 'excellencia2026', 'facultyId': 'FAC02'}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req_fac) as res:
        fac_res = json.loads(res.read().decode('utf-8'))
        assert fac_res['success'] is True
        print(f"✓ Faculty Login Success: {fac_res['message']} (Logged in: {fac_res['faculty']['name']})")

    # Incorrect passcode (must reject with 401)
    try:
        req_bad = urllib.request.Request(
            'http://localhost:5000/api/faculty/login',
            data=json.dumps({'passcode': 'wrong_passcode'}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        urllib.request.urlopen(req_bad)
        assert False, "Should have failed with 401"
    except urllib.error.HTTPError as err:
        assert err.code == 401
        print("✓ Unauthorized teacher access correctly blocked (HTTP 401).")

    print("\n--- 9. Testing Excel Bulk Student Upload API ---")
    with urllib.request.urlopen('http://localhost:5000/api/students/sample-template') as res:
        assert res.status == 200
        template_bytes = res.read()
        assert len(template_bytes) > 1000
        print(f"✓ Downloaded sample Excel template ({len(template_bytes)} bytes).")

    # Test uploading that template back
    boundary3 = '----Boundary' + uuid.uuid4().hex
    body_excel = bytearray()
    body_excel.extend(f'--{boundary3}\r\nContent-Disposition: form-data; name="file"; filename="Excellencia_Students.xlsx"\r\nContent-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n'.encode('utf-8'))
    body_excel.extend(template_bytes)
    body_excel.extend(f'\r\n--{boundary3}--\r\n'.encode('utf-8'))

    excel_req = urllib.request.Request(
        'http://localhost:5000/api/students/bulk-upload',
        data=bytes(body_excel),
        headers={
            'Content-Type': f'multipart/form-data; boundary={boundary3}',
            'Content-Length': str(len(body_excel))
        }
    )
    with urllib.request.urlopen(excel_req) as res:
        excel_res = json.loads(res.read().decode('utf-8'))
        assert excel_res['success'] is True
        print(f"✓ Excel Bulk Import Success: {excel_res['message']} (Processed {excel_res['count']} students)")

    # Clean up test uploaded students
    del_stu_req = urllib.request.Request(
        'http://localhost:5000/api/students/bulk-delete',
        data=json.dumps({'ids': ['925001', '925002', '925003']}).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(del_stu_req) as res:
        print("✓ Cleaned up test bulk students.")

    print("\n==========================================")
    print("ALL TESTS PASSED WITH 100% SUCCESS!")
    print("==========================================")

if __name__ == '__main__':
    run_tests()
