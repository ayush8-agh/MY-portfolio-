# Ayush Trivedi Portfolio — Setup Guide

## 🚀 Quick Start (Local)

```bash
cd ayush-portfolio
node server.js
```
Then open http://localhost:3000 (or http://localhost:3001)

---

## 📝 Editing Your Portfolio Content

**All content is in one file: `data/data.json`**

Open it and update:
- `personal` → Your name, bio, email, phone, city, GitHub, LinkedIn
- `projects[]` → Add/remove/edit projects
- `experience[]` → Jobs, internships, hackathons
- `skills` → Engineering tools, programming languages, dev tools
- `education[]` → Degrees and coursework
- `certifications[]` → Online certificates
- `resume.link` → Your Google Drive / Dropbox resume link
- `adminPassword` → Change this to your preferred admin password

---

## 🔐 Admin Panel

Visit `/admin.html` on your live site.

**Default password**: `ayush2005`  
**Change it**: Edit `adminPassword` in `data.json` and redeploy.

### How to use:
1. Login with your password
2. Add/edit projects, experience, skills
3. Go to **Export** tab → Click "Generate JSON" → "Download data.json"
4. Replace `data/data.json` in your project folder
5. Push to GitHub → Netlify auto-deploys

---

## 📧 Setting Up the Contact Form (EmailJS)

1. Go to https://www.emailjs.com → **Sign Up** (free)
2. Create a **Service** (Gmail or Outlook) → note the **Service ID**
3. Create an **Email Template** with these variables:
   - `{{from_name}}` — sender's name
   - `{{from_email}}` — sender's email
   - `{{subject}}` — subject
   - `{{message}}` — the message
   - `{{to_name}}` — "Ayush Trivedi"
4. Note your **Template ID** and **Public Key**

### Add to Netlify:
1. Go to your Netlify site → **Site Settings** → **Environment Variables**
2. Add:
   ```
   EMAILJS_SERVICE_ID     = service_xxxxxxx
   EMAILJS_TEMPLATE_ID    = template_xxxxxxx
   EMAILJS_PUBLIC_KEY     = your_public_key
   ```
3. Redeploy

---

## 🌐 Deploying to Netlify

### Method 1: Drag & Drop (easiest)
1. Go to https://netlify.com → Log in
2. Drag the `ayush-portfolio` folder onto the Netlify dashboard
3. Done! You get a live URL instantly

### Method 2: GitHub (recommended for auto-deploy)
1. Create a GitHub repo: https://github.com/new
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git remote add origin https://github.com/ayush8-agh/YOUR-REPO.git
   git push -u origin main
   ```
3. On Netlify → **Add new site** → **Import from Git** → Connect GitHub → Select repo
4. Build settings: **publish directory = `.`** (dot for root) 
5. Deploy! Every `git push` auto-deploys

### Custom Domain (optional)
- Netlify → Domain settings → Add your domain → Follow DNS instructions

---

## 📁 File Structure

```
ayush-portfolio/
├── index.html           ← Main portfolio (don't edit, managed via data.json)
├── admin.html           ← Admin panel
├── data/
│   └── data.json        ← ⭐ EDIT THIS to update your portfolio
├── css/
│   └── style.css        ← Styling
├── js/
│   ├── main.js          ← Data loading & rendering
│   ├── animations.js    ← anime.js animations
│   └── admin.js         ← Admin panel logic
├── netlify/
│   └── functions/
│       └── contact.js   ← Contact form backend
├── netlify.toml         ← Netlify config
├── package.json
└── SETUP.md             ← This file
```

---

## ✨ Customisation Tips

### Change the colour scheme
Edit these CSS variables in `css/style.css`:
```css
--accent-cyan:   #00d4ff;   /* Main highlight colour */
--accent-orange: #ff6b2b;   /* Secondary accent */
--bg-primary:    #040d18;   /* Page background */
```

### Add your photo
1. Add your photo as `images/ayush.jpg`
2. In `data.json` set `"avatar": "images/ayush.jpg"`
3. In `index.html`, replace the `photo-placeholder` div with `<img src="images/ayush.jpg" alt="Ayush Trivedi" class="about-photo"/>`

### Add more projects
Just add to the `projects[]` array in `data.json` — done!

---

Made with ❤️ + anime.js
