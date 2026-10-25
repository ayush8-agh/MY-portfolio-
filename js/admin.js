/* ============================================================
   admin.js — Portfolio Admin Panel Logic
   ============================================================ */

'use strict';

let portfolioData = null;
const STORAGE_KEY = 'ayush_portfolio_data';

// ─── AUTH ────────────────────────────────────────────────────
async function loadPortfolioData() {
  // Try localStorage first (admin edits)
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  // Fallback to file
  const res = await fetch('data/data.json');
  return res.json();
}

function doLogin() {
  const pass = document.getElementById('admin-pass').value;
  loadPortfolioData().then(data => {
    if (pass === data.adminPassword) {
      portfolioData = data;
      document.getElementById('admin-login').style.display = 'none';
      document.getElementById('admin-panel').style.display = 'block';
      renderAllAdmin();
    } else {
      document.getElementById('login-error').style.display = 'block';
    }
  });
}
document.getElementById('admin-pass').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});

function doLogout() {
  document.getElementById('admin-login').style.display = 'flex';
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('admin-pass').value = '';
}

// ─── TABS ────────────────────────────────────────────────────
document.querySelectorAll('.admin-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'personal') populatePersonalForm();
  });
});

// ─── RENDER ALL ──────────────────────────────────────────────
function renderAllAdmin() {
  renderProjectsList();
  renderExperienceList();
  renderEducationList();
  renderCertsList();
  renderSkillsAdmin();
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolioData));
}

// ─── PROJECTS CRUD ────────────────────────────────────────────
function renderProjectsList() {
  const list = document.getElementById('projects-list');
  list.innerHTML = portfolioData.projects.map((p, i) => `
    <div class="admin-card">
      <div class="admin-card-header">
        <span class="admin-card-title">${p.title}</span>
        <div class="admin-card-actions">
          <button class="btn-success" onclick="editProject(${i})"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-danger" onclick="deleteProject(${i})"><i class="fas fa-trash"></i> Delete</button>
        </div>
      </div>
      <div style="color:var(--text-muted);font-size:0.85rem">${p.description.slice(0, 100)}...</div>
      <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
        ${(p.tags||[]).map(t => `<span style="padding:2px 10px;border-radius:20px;font-size:0.72rem;background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);color:var(--accent-cyan)">${t}</span>`).join('')}
        ${p.featured ? '<span style="padding:2px 10px;border-radius:20px;font-size:0.72rem;background:rgba(255,107,43,0.1);border:1px solid rgba(255,107,43,0.3);color:var(--accent-orange)">⭐ Featured</span>' : ''}
      </div>
    </div>
  `).join('');
}

function openAddProject() { openProjectModal(null, -1); }
function editProject(i) { openProjectModal(portfolioData.projects[i], i); }

function openProjectModal(proj, idx) {
  const isEdit = idx >= 0;
  const p = proj || { title:'', description:'', tags:[], github:'', demo:'', featured: false };
  openModal(`
    <h3>${isEdit ? '✏️ Edit Project' : '➕ Add Project'}</h3>
    <div class="form-group"><label>Title</label><input type="text" id="m-title" value="${p.title}"/></div>
    <div class="form-group"><label>Description</label><textarea id="m-desc">${p.description}</textarea></div>
    <div class="form-group"><label>Tags (comma separated)</label><input type="text" id="m-tags" value="${(p.tags||[]).join(', ')}"/></div>
    <div class="form-group"><label>GitHub URL</label><input type="text" id="m-github" value="${p.github||''}"/></div>
    <div class="form-group"><label>Demo URL</label><input type="text" id="m-demo" value="${p.demo||''}"/></div>
    <div class="form-group" style="flex-direction:row;align-items:center;gap:12px">
      <input type="checkbox" id="m-featured" ${p.featured ? 'checked' : ''} style="width:20px;height:20px;accent-color:var(--accent-orange)"/>
      <label for="m-featured" style="font-size:0.9rem">Mark as Featured</label>
    </div>
    <div class="modal-actions">
      <button class="btn-outline" style="padding:8px 18px" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveProject(${idx})"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveProject(idx) {
  const proj = {
    title: document.getElementById('m-title').value,
    description: document.getElementById('m-desc').value,
    tags: document.getElementById('m-tags').value.split(',').map(t => t.trim()).filter(Boolean),
    github: document.getElementById('m-github').value,
    demo: document.getElementById('m-demo').value,
    featured: document.getElementById('m-featured').checked,
    image: ''
  };
  if (idx >= 0) portfolioData.projects[idx] = proj;
  else portfolioData.projects.push(proj);
  saveData();
  renderProjectsList();
  closeModal();
}

function deleteProject(i) {
  if (!confirm('Delete this project?')) return;
  portfolioData.projects.splice(i, 1);
  saveData();
  renderProjectsList();
}

// ─── EXPERIENCE CRUD ─────────────────────────────────────────
function renderExperienceList() {
  const list = document.getElementById('experience-list');
  list.innerHTML = portfolioData.experience.map((e, i) => `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">${e.company}</div>
          <div style="color:var(--accent-orange);font-size:0.85rem">${e.role} · ${e.duration}</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn-success" onclick="editExperience(${i})"><i class="fas fa-edit"></i></button>
          <button class="btn-danger" onclick="deleteExperience(${i})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');
}

function openAddExperience() { openExperienceModal(null, -1); }
function editExperience(i) { openExperienceModal(portfolioData.experience[i], i); }

function openExperienceModal(exp, idx) {
  const e = exp || { company:'', role:'', duration:'', description:[], tags:[] };
  openModal(`
    <h3>${idx >= 0 ? '✏️ Edit' : '➕ Add'} Experience</h3>
    <div class="form-row">
      <div class="form-group"><label>Company</label><input type="text" id="m-company" value="${e.company}"/></div>
      <div class="form-group"><label>Role</label><input type="text" id="m-role" value="${e.role}"/></div>
    </div>
    <div class="form-group"><label>Duration</label><input type="text" id="m-duration" value="${e.duration}" placeholder="e.g. Jan 2024 - Dec 2024"/></div>
    <div class="form-group"><label>Description (one per line)</label><textarea id="m-expdesc">${(e.description||[]).join('\n')}</textarea></div>
    <div class="form-group"><label>Tags (comma separated)</label><input type="text" id="m-exptags" value="${(e.tags||[]).join(', ')}"/></div>
    <div class="form-group"><label>Certificate URL</label><input type="text" id="m-cert" value="${e.certificate||''}"/></div>
    <div class="modal-actions">
      <button class="btn-outline" style="padding:8px 18px" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveExperience(${idx})"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}

function saveExperience(idx) {
  const exp = {
    company: document.getElementById('m-company').value,
    role: document.getElementById('m-role').value,
    duration: document.getElementById('m-duration').value,
    description: document.getElementById('m-expdesc').value.split('\n').filter(Boolean),
    tags: document.getElementById('m-exptags').value.split(',').map(t => t.trim()).filter(Boolean),
    certificate: document.getElementById('m-cert').value,
    logo: ''
  };
  if (idx >= 0) portfolioData.experience[idx] = exp;
  else portfolioData.experience.push(exp);
  saveData();
  renderExperienceList();
  closeModal();
}

function deleteExperience(i) {
  if (!confirm('Delete this experience entry?')) return;
  portfolioData.experience.splice(i, 1);
  saveData();
  renderExperienceList();
}

// ─── EDUCATION CRUD ──────────────────────────────────────────
function renderEducationList() {
  const list = document.getElementById('education-list');
  if (!list) return;
  list.innerHTML = (portfolioData.education || []).map((e, i) => `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">${e.degree}</div>
          <div style="color:var(--accent-cyan);font-size:0.85rem">${e.institution} · ${e.duration}</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn-success" onclick="editEducation(${i})"><i class="fas fa-edit"></i></button>
          <button class="btn-danger" onclick="deleteEducation(${i})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');
}
function openAddEducation() { openEducationModal(null, -1); }
function editEducation(i) { openEducationModal(portfolioData.education[i], i); }
function openEducationModal(edu, idx) {
  const e = edu || { degree:'', institution:'', duration:'', coursework:[] };
  openModal(`
    <h3>${idx >= 0 ? '✏️ Edit' : '➕ Add'} Education</h3>
    <div class="form-group"><label>Degree</label><input type="text" id="m-degree" value="${e.degree || ''}"/></div>
    <div class="form-group"><label>Institution</label><input type="text" id="m-institution" value="${e.institution || ''}"/></div>
    <div class="form-group"><label>Duration</label><input type="text" id="m-eduduration" value="${e.duration || ''}"/></div>
    <div class="form-group"><label>Coursework (one per line)</label><textarea id="m-coursework">${(e.coursework||[]).join('\n')}</textarea></div>
    <div class="modal-actions">
      <button class="btn-outline" style="padding:8px 18px" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveEducation(${idx})"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}
function saveEducation(idx) {
  const edu = {
    degree: document.getElementById('m-degree').value,
    institution: document.getElementById('m-institution').value,
    duration: document.getElementById('m-eduduration').value,
    coursework: document.getElementById('m-coursework').value.split('\n').filter(Boolean),
  };
  if (!portfolioData.education) portfolioData.education = [];
  if (idx >= 0) portfolioData.education[idx] = edu;
  else portfolioData.education.push(edu);
  saveData(); renderEducationList(); closeModal();
}
function deleteEducation(i) {
  if (!confirm('Delete this education entry?')) return;
  portfolioData.education.splice(i, 1);
  saveData(); renderEducationList();
}

// ─── CERTIFICATIONS CRUD ─────────────────────────────────────
function renderCertsList() {
  const list = document.getElementById('certs-list');
  if (!list) return;
  list.innerHTML = (portfolioData.certifications || []).map((c, i) => `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">${c.title}</div>
          <div style="color:var(--text-muted);font-size:0.85rem">${c.issuer}</div>
        </div>
        <div class="admin-card-actions">
          <button class="btn-success" onclick="editCert(${i})"><i class="fas fa-edit"></i></button>
          <button class="btn-danger" onclick="deleteCert(${i})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');
}
function openAddCert() { openCertModal(null, -1); }
function editCert(i) { openCertModal(portfolioData.certifications[i], i); }
function openCertModal(cert, idx) {
  const c = cert || { title:'', issuer:'', link:'' };
  openModal(`
    <h3>${idx >= 0 ? '✏️ Edit' : '➕ Add'} Certification</h3>
    <div class="form-group"><label>Title</label><input type="text" id="m-ctitle" value="${c.title || ''}"/></div>
    <div class="form-group"><label>Issuer</label><input type="text" id="m-cissuer" value="${c.issuer || ''}"/></div>
    <div class="form-group"><label>Link</label><input type="text" id="m-clink" value="${c.link || ''}"/></div>
    <div class="modal-actions">
      <button class="btn-outline" style="padding:8px 18px" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveCert(${idx})"><i class="fas fa-save"></i> Save</button>
    </div>
  `);
}
function saveCert(idx) {
  const cert = {
    title: document.getElementById('m-ctitle').value,
    issuer: document.getElementById('m-cissuer').value,
    link: document.getElementById('m-clink').value,
  };
  if (!portfolioData.certifications) portfolioData.certifications = [];
  if (idx >= 0) portfolioData.certifications[idx] = cert;
  else portfolioData.certifications.push(cert);
  saveData(); renderCertsList(); closeModal();
}
function deleteCert(i) {
  if (!confirm('Delete this certification?')) return;
  portfolioData.certifications.splice(i, 1);
  saveData(); renderCertsList();
}

// ─── SKILLS ADMIN ─────────────────────────────────────────────
function renderSkillsAdmin() {
  const wrap = document.getElementById('skills-admin');
  const categories = [
    { key: 'engineeringTools', label: '⚙️ Engineering Tools' },
    { key: 'programmingLanguages', label: '💻 Programming Languages' },
    { key: 'devTools', label: '🔧 Dev & Hardware Tools' },
  ];
  wrap.innerHTML = categories.map(cat => `
    <div class="admin-card" style="margin-bottom:20px">
      <div class="admin-card-header">
        <span class="admin-card-title">${cat.label}</span>
        <button class="add-new-btn" style="margin:0;padding:8px 16px;font-size:0.82rem" onclick="addSkill('${cat.key}')">+ Add Skill</button>
      </div>
      <div id="skills-${cat.key}">
        ${(portfolioData.skills[cat.key]||[]).map((s, i) => `
          <div class="skill-row">
            <div>
              <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
                <input type="text" value="${s.name}" style="flex:1;background:var(--bg-secondary);border:1px solid var(--border-dim);border-radius:6px;padding:6px 10px;color:var(--text-primary);font-size:0.88rem"
                  onchange="updateSkillName('${cat.key}', ${i}, this.value)"/>
                <button class="btn-danger" onclick="deleteSkill('${cat.key}', ${i})" style="padding:4px 10px">✕</button>
              </div>
              <input type="range" min="0" max="100" value="${s.level}" style="width:100%"
                oninput="updateSkillLevel('${cat.key}', ${i}, this.value); this.nextElementSibling.textContent = this.value + '%'"/>
              <span class="skill-pct-display">${s.level}%</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function addSkill(catKey) {
  portfolioData.skills[catKey].push({ name: 'New Skill', level: 70 });
  saveData(); renderSkillsAdmin();
}
function updateSkillName(catKey, i, val) {
  portfolioData.skills[catKey][i].name = val;
  saveData();
}
function updateSkillLevel(catKey, i, val) {
  portfolioData.skills[catKey][i].level = parseInt(val);
  saveData();
}
function deleteSkill(catKey, i) {
  portfolioData.skills[catKey].splice(i, 1);
  saveData(); renderSkillsAdmin();
}

// ─── PERSONAL INFO ────────────────────────────────────────────
function populatePersonalForm() {
  const p = portfolioData.personal;
  document.getElementById('p-name').value = p.name || '';
  document.getElementById('p-tagline').value = p.tagline || '';
  document.getElementById('p-bio').value = p.bio || '';
  document.getElementById('p-email').value = p.email || '';
  document.getElementById('p-phone').value = p.phone || '';
  document.getElementById('p-city').value = p.city || '';
  document.getElementById('p-github').value = p.github || '';
  document.getElementById('p-linkedin').value = p.linkedin || '';
  document.getElementById('p-resume').value = portfolioData.resume?.link || '';
}

function savePersonal() {
  portfolioData.personal.name = document.getElementById('p-name').value;
  portfolioData.personal.tagline = document.getElementById('p-tagline').value;
  portfolioData.personal.bio = document.getElementById('p-bio').value;
  portfolioData.personal.email = document.getElementById('p-email').value;
  portfolioData.personal.phone = document.getElementById('p-phone').value;
  portfolioData.personal.city = document.getElementById('p-city').value;
  portfolioData.personal.github = document.getElementById('p-github').value;
  portfolioData.personal.linkedin = document.getElementById('p-linkedin').value;
  if (!portfolioData.resume) portfolioData.resume = {};
  portfolioData.resume.link = document.getElementById('p-resume').value;
  saveData();
  alert('✅ Personal info saved! Export JSON to apply changes.');
}

// ─── EXPORT ───────────────────────────────────────────────────
function generateExport() {
  const json = JSON.stringify(portfolioData, null, 2);
  const preview = document.getElementById('export-preview');
  const dlBtn = document.getElementById('download-btn');
  preview.textContent = json.slice(0, 800) + '\n\n... (truncated preview)';
  preview.style.display = 'block';
  dlBtn.style.display = 'inline-flex';
  window._exportJson = json;
}

function downloadJson() {
  const blob = new Blob([window._exportJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'data.json';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── MODAL ────────────────────────────────────────────────────
function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-backdrop').style.display = 'flex';
}
function closeModal() {
  document.getElementById('modal-backdrop').style.display = 'none';
}
document.getElementById('modal-backdrop').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-backdrop')) closeModal();
});
