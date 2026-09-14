# 🌐 How to Host Excellencia West Marredpally Online (24/7 Free)

This guide takes your local project and puts it **live on the internet** so that:
1. Any student or teacher can access it from their phone or computer anywhere in the world.
2. Google indexes the website when someone searches **"Excellencia West Marredpally"**.
3. Teachers can log in securely with their passcode to upload worksheets and DPPs.
4. Students can log in with their Student ID to view, download, and ask doubts on WhatsApp.

---

## ⚡ Quick Summary of What We Configured
- ✅ **Separate Teacher Access**: Secured with faculty passcode (`excellencia2026`).
- ✅ **Student ID Access**: Instant login (`EXM101`, `EXM102`, etc.) with class/batch filtering.
- ✅ **Direct Faculty WhatsApp Routing**: Auto-generates doubt messages and opens teachers' WhatsApp chats.
- ✅ **Google SEO Meta Tags**: Embedded in `index.html` targeting "Excellencia West Marredpally".
- ✅ **Cloud-Ready Server**: Auto-binds to `0.0.0.0` with dynamic port assignment.
- ✅ **Git Repository Initialized**: Ready to push to GitHub.

---

## 🚀 Step 1: Push Code to GitHub (1 Minute)

1. Open your browser and go to **[github.com](https://github.com)** (sign in or create a free account).
2. Click the **"+"** icon in the top right and select **"New repository"**.
3. Name your repository:
   - **Repository name**: `excellencia-westmarredpally`
   - **Visibility**: `Public` (or `Private`)
   - Do **NOT** check "Add a README file" or ".gitignore" (we already created them).
4. Click **"Create repository"**.
5. Copy the 3 commands shown on GitHub under **"…or push an existing repository from the command line"**, which will look like:

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/excellencia-westmarredpally.git
git branch -M main
git push -u origin main
```

Run those 3 commands in your terminal in this directory. Your code is now safely on GitHub!

---

## ☁️ Step 2: Deploy for Free on Render.com (2 Minutes)

**Render.com** is a premier free cloud hosting platform for full-stack Node.js apps.

1. Go to **[render.com](https://render.com)** and sign up / log in with your **GitHub account**.
2. On your Render dashboard, click **"New +"** → **"Web Service"**.
3. Select **"Build and deploy from a Git repository"** and click **Next**.
4. Find and select your `excellencia-westmarredpally` repository (click **Connect**).
5. Fill in these simple settings:
   - **Name**: `excellencia-westmarredpally`
   - **Region**: Singapore or Frankfurt (fastest for India)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` ($0/month)
6. Scroll down and click **"Deploy Web Service"**.

Render will automatically install packages, compile the React portal, and start your server. In about 2 minutes, you will get your permanent live URL:
👉 **`https://excellencia-westmarredpally.onrender.com`**

---

## 🔍 Step 3: Make it Appear on Google Search

Once your website is live:
1. Go to **[Google Search Console](https://search.google.com/search-console)**.
2. Click **"Add Property"** and enter your URL (e.g. `https://excellencia-westmarredpally.onrender.com` or your custom domain).
3. Verify ownership (via HTML tag or DNS).
4. Click **"URL Inspection"** → enter your homepage URL → click **"Request Indexing"**.

Google will crawl your page. Because we added the SEO title, description, and keywords for *Excellencia Junior College West Marredpally*, searching for **"Excellencia West Marredpally"** will bring up your portal!

---

## 🏷️ Optional: Use a Custom College Domain
If Excellencia wants a domain like `portal.excellencia.edu.in` or `excellenciawestmarredpally.in`:
1. In your **Render Dashboard** → click your web service → **"Settings"** → **"Custom Domains"**.
2. Enter your domain name.
3. Add the CNAME record in your domain registrar (GoDaddy / Namecheap / Google Domains).
4. Render automatically provisions a free SSL/HTTPS security certificate.

---

## 🔑 Login Credentials for Live Testing

### 👨‍🏫 Teacher / Faculty Login:
* **Access**: Click **"Faculty Portal"** in the top navbar.
* **Passcode**: `excellencia2026`
* **Features**: Upload new PDF worksheets, edit WhatsApp contact numbers, manage students.

### 👨‍🎓 Student Login:
* **Access**: Click **"Student Login"** in the top navbar.
* **Demo Student IDs**:
  * `EXM101` — Aarav Sharma (Class 11, JEE / MPC)
  * `EXM102` — Ananya Reddy (Class 12, NEET / BiPC)
  * `EXM103` — Sai Krishna (Class 12, JEE Advanced / MPC)
  * `EXM104` — Rhea Verghese (Class 11, IPE + NEET / BiPC)
