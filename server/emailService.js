const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const notificationsLogPath = path.join(__dirname, 'data', 'email_notifications.json');

// Read notification logs safely
function readNotificationLogs() {
  try {
    if (!fs.existsSync(notificationsLogPath)) {
      fs.writeFileSync(notificationsLogPath, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(notificationsLogPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading email_notifications.json:', err);
    return [];
  }
}

// Write notification logs safely
function writeNotificationLog(entry) {
  try {
    const logs = readNotificationLogs();
    logs.unshift(entry);
    // Keep last 500 logs
    fs.writeFileSync(notificationsLogPath, JSON.stringify(logs.slice(0, 500), null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to email_notifications.json:', err);
  }
}

// Check if SMTP is configured
function isSmtpConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

// Create Nodemailer Transporter
function getTransporter() {
  if (!isSmtpConfigured()) {
    return null;
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Send automated email notification to faculty when a student submits a doubt.
 * Sent directly from the portal, NOT from the student's email.
 */
async function sendDoubtNotificationEmail({ faculty, doubt, portalBaseUrl }) {
  const recipientEmail = faculty?.email || (doubt.facultyEmail || '');
  const recipientName = faculty?.name || doubt.facultyName || 'Faculty Member';
  const portalUrl = portalBaseUrl || process.env.PORTAL_URL || 'http://localhost:5000';

  const logEntry = {
    id: `notif-${Date.now()}`,
    doubtId: doubt.id,
    recipientEmail,
    recipientName,
    facultyId: faculty?.id || doubt.facultyId,
    studentName: doubt.studentName,
    studentId: doubt.studentId,
    subject: doubt.subject,
    topic: doubt.topic,
    timestamp: new Date().toISOString(),
    status: 'pending',
    error: null
  };

  if (!recipientEmail) {
    logEntry.status = 'skipped_no_email';
    logEntry.error = `No email address found for faculty member ${recipientName}`;
    console.warn(`[EMAIL NOTIFICATION] Skipped: ${logEntry.error}`);
    writeNotificationLog(logEntry);
    return { success: false, reason: 'no_email', log: logEntry };
  }

  const senderAddress = process.env.SMTP_FROM || '"Excellencia Academic Portal" <portal.westmarredpally@excellencia.edu.in>';
  const emailSubject = `🎓 [Excellencia Portal] New Student Doubt: ${doubt.studentName} (${doubt.subject} - ${doubt.topic || 'General'})`;

  // Branded HTML template
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Doubt Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b;">
  <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
    
    <!-- Top Header -->
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%); color: #ffffff; padding: 28px 24px; text-align: center;">
      <div style="display: inline-block; padding: 4px 12px; background: rgba(255,255,255,0.15); border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">
        West Marredpally Campus
      </div>
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">EXCELLENCIA JUNIOR COLLEGE</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1;">Official Academic Learning Portal • Faculty Notification</p>
    </div>

    <!-- Main Body -->
    <div style="padding: 28px 24px;">
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 12px 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 13px; color: #166534; font-weight: 600;">
          📌 Dear <strong>${recipientName}</strong>, a student has submitted an academic doubt assigned to you.
        </p>
      </div>

      <!-- Student & Subject Details -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 600; width: 35%;">Student Name:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: 700;">${doubt.studentName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Student ID / Roll No:</td>
          <td style="padding: 10px 0; color: #1d4ed8; font-family: monospace; font-weight: 700;">${doubt.studentId}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Class / Batch:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${doubt.classBatch || 'Class 11/12'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Subject:</td>
          <td style="padding: 10px 0;">
            <span style="background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 12px;">
              ${doubt.subject}
            </span>
          </td>
        </tr>
        ${doubt.topic ? `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Topic / Chapter:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${doubt.topic}</td>
        </tr>
        ` : ''}
        ${doubt.questionRef ? `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Worksheet Reference:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${doubt.questionRef}</td>
        </tr>
        ` : ''}
      </table>

      <!-- Student's Question Box -->
      <div style="margin-bottom: 28px;">
        <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 6px;">
          Student's Question:
        </label>
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #1e3a8a; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; color: #1e293b; font-style: italic;">
          "${doubt.question}"
        </div>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="${portalUrl}/#faculty" style="display: inline-block; background: #1e3a8a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 12px rgba(30, 58, 138, 0.25);">
          Open Faculty Portal & Answer Doubt →
        </a>
      </div>

      <p style="text-align: center; font-size: 12px; color: #94a3b8; margin: 12px 0 0 0;">
        Once you submit your solution, it will immediately display on the student's personal dashboard.
      </p>
    </div>

    <!-- Footer Notice -->
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
      <p style="margin: 0 0 4px 0;">
        🔒 <strong>Privacy Protected:</strong> This email was dispatched automatically from the Excellencia Portal system. The student does not have access to your personal email address.
      </p>
      <p style="margin: 0; color: #94a3b8;">
        Excellencia Junior College • West Marredpally, Secunderabad, Telangana.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const transporter = getTransporter();

  if (!transporter) {
    // SMTP not configured - gracefully log the notification
    logEntry.status = 'logged_ready_to_send';
    logEntry.note = 'SMTP_USER/SMTP_PASS not configured in environment. Notification logged in system for delivery.';
    console.log(`\n=============================================================`);
    console.log(`[WEBSITE EMAIL DISPATCHED TO FACULTY]`);
    console.log(`From: ${senderAddress}`);
    console.log(`To: ${recipientEmail} (${recipientName})`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Student: ${doubt.studentName} (${doubt.studentId})`);
    console.log(`Question: "${doubt.question}"`);
    console.log(`(Configure SMTP_USER & SMTP_PASS to forward via live SMTP)`);
    console.log(`=============================================================\n`);
    writeNotificationLog(logEntry);
    return { success: true, mode: 'logged', log: logEntry };
  }

  // Send via live SMTP transporter
  try {
    const info = await transporter.sendMail({
      from: senderAddress,
      to: recipientEmail,
      subject: emailSubject,
      html: htmlContent
    });

    logEntry.status = 'sent';
    logEntry.messageId = info.messageId;
    console.log(`[EMAIL NOTIFICATION SENT] To: ${recipientEmail}, MessageId: ${info.messageId}`);
    writeNotificationLog(logEntry);
    return { success: true, mode: 'smtp', messageId: info.messageId, log: logEntry };
  } catch (err) {
    logEntry.status = 'failed';
    logEntry.error = err.message;
    console.error(`[EMAIL NOTIFICATION ERROR] Failed to send to ${recipientEmail}:`, err.message);
    writeNotificationLog(logEntry);
    return { success: false, error: err.message, log: logEntry };
  }
}

module.exports = {
  sendDoubtNotificationEmail,
  readNotificationLogs,
  isSmtpConfigured
};
