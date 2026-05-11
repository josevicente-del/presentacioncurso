/* ══════════════════════════════════════════
   main.js - Carga de datos y filtrado
══════════════════════════════════════════ */
let DATA = { repos: [], webs: [], skills: [] };

/* ══════════════════════════════════════════
   TAG HELPERS
══════════════════════════════════════════ */
const tagClass = {
  web: 'tag-web', ia: 'tag-ia', data: 'tag-data',
  deploy: 'tag-deploy', git: 'tag-git'
};

function techTag(t) {
  const map = {
    'HTML':'tag-web','CSS':'tag-web','JavaScript':'tag-web',
    'React':'tag-web','Vue':'tag-web','Node.js':'tag-data',
    'Python':'tag-data','IA':'tag-ia','Claude':'tag-ia',
    'ChatGPT':'tag-ia','Copilot':'tag-ia','Make':'tag-deploy',
    'Zapier':'tag-deploy','GitHub':'tag-git','Varias':'tag-ia'
  };
  const cls = map[t] || 'tag-ia';
  return `<span class="tag ${cls} me-1">${t}</span>`;
}

function nivelTag(n) {
  const map = { 'Básico':'tag-web', 'Intermedio':'tag-ia', 'Avanzado':'tag-deploy' };
  return `<span class="tag ${map[n] || 'tag-web'}">${n}</span>`;
}

function estadoTag(e) {
  return e.toLowerCase() === 'activo'
    ? `<span class="tag tag-ia">${e}</span>`
    : `<span class="tag tag-data">${e}</span>`;
}

/* ══════════════════════════════════════════
   RENDER TABLES
══════════════════════════════════════════ */
function renderRepos() {
  const tbody = document.getElementById('tbody-repos');
  tbody.innerHTML = DATA.repos.map(r => `
    <tr data-search="${[r.nombre, r.descripcion, ...r.tecnologias, r.categoria].join(' ').toLowerCase()}"
        data-cat="${r.categoria.toLowerCase()}">
      <td><strong style="font-family:'Syne',sans-serif">${r.nombre}</strong></td>
      <td style="color:var(--text-muted);max-width:300px;line-height:1.5">${r.descripcion}</td>
      <td>${r.tecnologias.map(techTag).join('')}</td>
      <td><span class="tag tag-git">${r.categoria}</span></td>
      <td>
        <a href="${r.enlace}" target="_blank" class="tbl-link">
          <i class="bi bi-github"></i> Ver repo
        </a>
      </td>
    </tr>
  `).join('');

  // populate category filter
  const sel = document.getElementById('filter-repos-cat');
  sel.innerHTML = '<option value="">Todas las categorías</option>'; // reset
  const cats = [...new Set(DATA.repos.map(r => r.categoria))];
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.toLowerCase(); opt.textContent = c;
    sel.appendChild(opt);
  });

  updateCount('repos');
  document.getElementById('stat-repos').textContent = DATA.repos.length;
}

function renderWebs() {
  const tbody = document.getElementById('tbody-webs');
  tbody.innerHTML = DATA.webs.map(w => `
    <tr data-search="${[w.titulo, w.url, ...w.tecnologias, w.estado].join(' ').toLowerCase()}"
        data-estado="${w.estado.toLowerCase()}">
      <td><strong style="font-family:'Syne',sans-serif">${w.titulo}</strong></td>
      <td>
        <a href="${w.url}" target="_blank" class="tbl-link">
          <i class="bi bi-globe2"></i> ${w.url.replace('https://','').replace(/\/$/,'')}
        </a>
      </td>
      <td>
        <a href="${w.repositorio}" target="_blank" class="tbl-link">
          <i class="bi bi-github"></i> GitHub
        </a>
      </td>
      <td>${w.tecnologias.map(techTag).join('')}</td>
      <td>${estadoTag(w.estado)}</td>
    </tr>
  `).join('');
  updateCount('webs');
  document.getElementById('stat-webs').textContent = DATA.webs.length;
}

function renderSkills() {
  const tbody = document.getElementById('tbody-skills');
  tbody.innerHTML = DATA.skills.map(s => `
    <tr data-search="${[s.habilidad, s.modulo, s.herramienta, s.nivel, s.aplicacion].join(' ').toLowerCase()}"
        data-nivel="${s.nivel.toLowerCase()}">
      <td><strong>${s.habilidad}</strong></td>
      <td style="color:var(--text-muted)">${s.modulo}</td>
      <td>${techTag(s.herramienta.split(' / ')[0])}</td>
      <td>${nivelTag(s.nivel)}</td>
      <td style="color:var(--text-muted);font-size:13px">${s.aplicacion}</td>
    </tr>
  `).join('');
  updateCount('skills');
  
  // Calculate unique technologies and categories for stats
  const allTechs = new Set();
  DATA.repos.forEach(r => r.tecnologias.forEach(t => allTechs.add(t)));
  DATA.webs.forEach(w => w.tecnologias.forEach(t => allTechs.add(t)));
  document.getElementById('stat-techs').textContent = allTechs.size;
  
  const allCats = new Set(DATA.repos.map(r => r.categoria));
  document.getElementById('stat-cats').textContent = allCats.size + 2; // Web + Repos + Skills
}

/* ══════════════════════════════════════════
   FILTER ENGINE
══════════════════════════════════════════ */
function filterTable(id) {
  const text = (document.getElementById(`filter-${id}-text`)?.value || '').toLowerCase();

  let selectVal = '';
  const selEl = document.querySelector(`[id^="filter-${id}-"]:not([id*="text"])`);
  if (selEl) selectVal = selEl.value.toLowerCase();

  const tbody = document.getElementById(`tbody-${id}`);
  const rows = tbody.querySelectorAll('tr');
  let visible = 0;

  rows.forEach(row => {
    const search = row.dataset.search || '';
    // secondary attribute (cat / estado / nivel)
    const secondary = row.dataset.cat || row.dataset.estado || row.dataset.nivel || '';

    const matchText = !text || search.includes(text);
    const matchSel  = !selectVal || secondary.includes(selectVal);

    if (matchText && matchSel) {
      row.classList.remove('hidden');
      visible++;
    } else {
      row.classList.add('hidden');
    }
  });

  document.getElementById(`empty-${id}`).style.display = visible === 0 ? 'block' : 'none';
  const cnt = document.getElementById(`count-${id}`);
  if (cnt) cnt.textContent = visible;
}

function resetFilter(id) {
  const textEl = document.getElementById(`filter-${id}-text`);
  if (textEl) textEl.value = '';
  const selEl = document.querySelector(`[id^="filter-${id}-"]:not([id*="text"])`);
  if (selEl) selEl.value = '';
  filterTable(id);
}

function updateCount(id) {
  const tbody = document.getElementById(`tbody-${id}`);
  const total = tbody.querySelectorAll('tr').length;
  const el = document.getElementById(`count-${id}`);
  if (el) el.textContent = total;
}

/* ══════════════════════════════════════════
   INIT & FETCH DATA
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Cargamos los datos directamente de la variable global de data.js
    DATA = JSON_DATA;
    
    renderRepos();
    renderWebs();
    renderSkills();
  } catch (error) {
    console.error('Error cargando los datos:', error);
  }
});
