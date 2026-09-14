/**
 * Helper to append student or faculty authentication parameters to protected /uploads/ URLs
 */
export function getProtectedFileUrl(fileUrl, student, facultyAuth) {
  if (!fileUrl) return '';
  // If external link (e.g. Google Drive), leave as is
  if (!fileUrl.startsWith('/uploads/')) return fileUrl;

  let queryParam = '';
  if (student && student.id) {
    queryParam = `studentId=${encodeURIComponent(student.id)}`;
  } else if (facultyAuth) {
    const fid = facultyAuth.id || 'FAC00';
    queryParam = `facultyId=${encodeURIComponent(fid)}&auth=faculty`;
  }

  if (!queryParam) return fileUrl;
  const separator = fileUrl.includes('?') ? '&' : '?';
  return `${fileUrl}${separator}${queryParam}`;
}
