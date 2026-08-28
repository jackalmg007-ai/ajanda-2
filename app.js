/* =========================================================
   Ajanda — Kişisel Planlayıcı
   Tek dosyalık istemci mantığı (framework yok).
   ========================================================= */

/* ---------- sabitler ---------- */
const MAIN_VIEWS = ['day','week','month','projects','info','address','customize'];
const VIEW_LABELS = { day:'Gün', week:'Hafta', month:'Ay', projects:'Projeler', info:'Bilgi', address:'Adres', customize:'Özelleştir' };

const WEEKDAYS_LONG = ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
const WEEKDAYS_SHORT = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
const WEEKDAYS_INITIAL = ['P','S','Ç','P','C','C','P'];
const MONTHS_LONG = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const MONTHS_SHORT = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];

const ICON_CATS = {
  cizgiler: ['―','═','┄','┅','▬','◆','●','▲','★','✦','▪','◇'],
  simgeler: ['📌','⭐','🔔','✔️','⚑','💡','📎','🔒','❤️','☀️','☂️','⚠️'],
  etkinlik: ['🎉','🎂','💍','🎓','✈️','🏖️','🎁','🎄','🍾','🎗️','🏆','🎫'],
  yasam:    ['🏠','🛒','🍽️','🏃','💊','🧹','🐾','🌱','🧺','🚗','⛽','🧾'],
  is:       ['💼','📞','💻','📧','📅','🖨️','📊','🖊️','📁','🤝','🏢','⏱️'],
};
const CAT_LABELS = { cizgiler:'Çizgiler', simgeler:'Simgeler', etkinlik:'Etkinlik', yasam:'Yaşam', is:'İş' };

const PROJECT_PALETTE = ['#e0cf49','#7fb14e','#4d86b6','#e08a2e','#bb4c42','#8567ab'];

const COVER_OPTIONS = [
  { id:'chestnut', name:'Kestane', bg:'radial-gradient(120% 140% at 20% 10%, #8a5330, #6b3c20 45%, #4a2814 100%)' },
  { id:'forest',   name:'Orman',   bg:'radial-gradient(120% 140% at 20% 10%, #5c7a4a, #3f5c34 45%, #26391f 100%)' },
  { id:'ocean',    name:'Okyanus', bg:'radial-gradient(120% 140% at 20% 10%, #3f6f8a, #2c516b 45%, #1a3646 100%)' },
  { id:'berry',    name:'Bordo',   bg:'radial-gradient(120% 140% at 20% 10%, #8a3f5e, #6b2c46 45%, #431a2c 100%)' },
  { id:'slate',    name:'Gümüş',   bg:'radial-gradient(120% 140% at 20% 10%, #93a0a8, #6c7981 45%, #454e54 100%)' },
  { id:'charcoal', name:'Antrasit',bg:'radial-gradient(120% 140% at 20% 10%, #4a4a4a, #2e2e2e 45%, #161616 100%)' },
];

const QP_ICONS = ['⭐','🔔','🎵','📌','☎️','💼','✉️','🌐','⏰'];

/* ---------- durum (state) ---------- */
const S = {
  currentDate: new Date(),
  view: 'day',
  activeTool: null,          // 'calculator' | 'mp3' | 'quikpix' | null
  notes: {},                 // dateKey -> string
  todos: {},                 // dateKey -> [{id,text,done,icon}]
  selectedIcon: '📌',
  iconCategory: 'simgeler',
  monthProjColors: {},       // "y-m-w" -> color
  projects: [
    { id:'p1', name:'Genel', color:'#4d86b6', notes:'' },
    { id:'p2', name:'İş', color:'#e08a2e', notes:'' },
    { id:'p3', name:'Kişisel', color:'#7fb14e', notes:'' },
  ],
  activeProjectId: 'overview',
  contacts: [],
  contactSearch: '',
  cover: 'chestnut',
  custSubtab: 'kapaklar',
  calc: { display:'0', prev:null, op:null, resetNext:false, mem:0 },
  quikpix: { sequence:[], userStep:0, round:0, score:0, best:0, playing:false, showing:false, muted:false, volume:0.5 },
  mp3: { playlist:['Sabah Kahvesi','Ofis Molası','Akşam Yürüyüşü'], trackIndex:0, playing:false, progress:0, volume:0.6 },
};

/* ---------- örnek veri (ilk açılış) ---------- */
(function seed(){
  const today = dkey(new Date());
  S.notes[today] = 'Bugünün notları burada...';
  S.todos[today] = [
    { id:uid(), text:'Sunum için son rötuşlar', done:false, icon:'💼' },
    { id:uid(), text:'Marketten süt al', done:false, icon:'🛒' },
    { id:uid(), text:'Ahmet\'i ara', done:true, icon:'📞' },
  ];
  S.contacts = [
    { id:uid(), name:'Ayşe Yılmaz', phone:'0532 000 00 00', email:'ayse@example.com' },
    { id:uid(), name:'Mehmet Kaya', phone:'0533 111 11 11', email:'mehmet@example.com' },
  ];
})();
loadLocal(); // bu bilgisayarda/USB oturumunda daha önce kaydedilmiş veri varsa örnek verinin üzerine yazar

/* ---------- kalıcı veri: otomatik kayıt + dışa/içe aktarma ----------
   Bu, USB bellekten taşınabilir kullanım için önemlidir: localStorage
   yalnızca ÇALIŞTIĞINIZ bilgisayara bağlıdır (Claude.ai içindeki canlı
   önizlemede engellenmiş olabilir; kendi tarayıcınızda dosyayı açtığınızda
   normal çalışır). Farklı bir bilgisayara geçtiğinizde verinizin sizinle
   gelmesi için "Dışa Aktar" ile bir .json dosyası oluşturup USB bellekte
   ajanda dosyasının yanına koyun; başka bir bilgisayarda "İçe Aktar" ile
   geri yükleyin. */
const STORAGE_KEY = 'ajanda_data_v1';

function serializeState(){
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    notes: S.notes,
    todos: S.todos,
    projects: S.projects,
    activeProjectId: S.activeProjectId,
    contacts: S.contacts,
    monthProjColors: S.monthProjColors,
    cover: S.cover,
    selectedIcon: S.selectedIcon,
    iconCategory: S.iconCategory,
  };
}
function applyState(data){
  if(!data || typeof data!=='object') return;
  if(data.notes && typeof data.notes==='object') S.notes = data.notes;
  if(data.todos && typeof data.todos==='object') S.todos = data.todos;
  if(Array.isArray(data.projects) && data.projects.length) S.projects = data.projects;
  if(data.activeProjectId) S.activeProjectId = data.activeProjectId;
  if(Array.isArray(data.contacts)) S.contacts = data.contacts;
  if(data.monthProjColors && typeof data.monthProjColors==='object') S.monthProjColors = data.monthProjColors;
  if(data.cover) S.cover = data.cover;
  if(data.selectedIcon) S.selectedIcon = data.selectedIcon;
  if(data.iconCategory) S.iconCategory = data.iconCategory;
}
function saveLocal(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState())); }
  catch(e){ /* localStorage yoksa (ör. sandbox önizleme) sessizce geç */ }
}
function loadLocal(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) applyState(JSON.parse(raw));
  }catch(e){ /* yoksay */ }
}
let saveDebounceTimer = null;
function scheduleSave(){
  clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(saveLocal, 400);
}
function exportData(){
  const blob = new Blob([JSON.stringify(serializeState(), null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'ajanda-veri.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
  showBackupStatus('Dışa aktarıldı: ajanda-veri.json indirildi.');
}
function importDataFromFile(file){
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = JSON.parse(reader.result);
      applyState(data);
      saveLocal();
      renderAll();
      showBackupStatus('Veriler içe aktarıldı.');
    }catch(e){
      showBackupStatus('Dosya okunamadı. Geçerli bir ajanda-veri.json seçtiğinizden emin olun.');
    }
  };
  reader.readAsText(file);
}
let backupStatusTimer = null;
function showBackupStatus(msg){
  const el = document.getElementById('backupStatus');
  if(!el) return;
  el.textContent = msg;
  clearTimeout(backupStatusTimer);
  backupStatusTimer = setTimeout(()=>{ if(el) el.textContent=''; }, 4000);
}

/* ---------- yardımcılar ---------- */
function pad(n){ return String(n).padStart(2,'0'); }
function dkey(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function sameDay(a,b){ return dkey(a)===dkey(b); }
function addDays(d,n){ const r=new Date(d); r.setDate(r.getDate()+n); return r; }
function addMonths(d,n){ const r=new Date(d); r.setMonth(r.getMonth()+n); return r; }
function addYears(d,n){ const r=new Date(d); r.setFullYear(r.getFullYear()+n); return r; }
function uid(){ return 'id'+Math.random().toString(36).slice(2,9)+Date.now().toString(36); }
function escapeHtml(s){
  return String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function mondayOf(d){
  const idx = (d.getDay()+6)%7; // 0=Mon
  return addDays(d, -idx);
}
function timeNow(){
  const t = new Date();
  return pad(t.getHours())+':'+pad(t.getMinutes());
}

/* ---------- DOM referansları ---------- */
const binderEl = document.getElementById('binder');
const tabsLeftEl = document.getElementById('tabsLeft');
const tabsRightEl = document.getElementById('tabsRight');
const pageLeftEl = document.getElementById('pageLeft');
const pageRightEl = document.getElementById('pageRight');
const floatingToolEl = document.getElementById('floatingTool');

/* ============================================================
   RENDER
   ============================================================ */
function renderAll(){
  binderEl.className = 'binder cover-' + S.cover;
  renderTabs();
  renderPages();
  renderFloatingTool();
}

function renderTabs(){
  const idx = MAIN_VIEWS.indexOf(S.view);
  const leftArr = MAIN_VIEWS.slice(0, idx+1);
  const rightArr = MAIN_VIEWS.slice(idx+1);
  tabsLeftEl.innerHTML = leftArr.map(v => tabBtn(v, v===S.view)).join('');
  tabsRightEl.innerHTML = rightArr.map(v => tabBtn(v, false)).join('');
}
function tabBtn(v, active){
  return `<button class="tab-btn tab-${v} ${active?'active':''}" data-action="setView" data-view="${v}">${VIEW_LABELS[v]}</button>`;
}

function pageHead(dateObj, extraRight){
  return `<div class="page-head"><span>${MONTHS_LONG[dateObj.getMonth()]} ${dateObj.getFullYear()}</span><span class="clock">${extraRight!==undefined?extraRight:timeNow()}</span></div>`;
}

function renderPages(){
  let html;
  switch(S.view){
    case 'day': html = viewDay(); break;
    case 'week': html = viewWeek(); break;
    case 'month': html = viewMonth(); break;
    case 'projects': html = viewProjects(); break;
    case 'info': html = viewInfo(); break;
    case 'address': html = viewAddress(); break;
    case 'customize': html = viewCustomize(); break;
    default: html = { left:'', right:'' };
  }
  pageLeftEl.innerHTML = html.left;
  pageRightEl.innerHTML = html.right;
  saveLocal();
}

/* ---------------- GÜN (DAY) ---------------- */
function viewDay(){
  const d = S.currentDate;
  const key = dkey(d);
  const note = S.notes[key] || '';
  const todos = S.todos[key] || [];

  const left = `
    ${pageHead(d)}
    <div class="date-row">
      <span class="nav-arrow" data-action="navDay" data-delta="-1">‹</span>
      <span class="date-circle">${d.getDate()}</span>
      <span>${WEEKDAYS_LONG[(d.getDay()+6)%7]}</span>
      <span class="nav-arrow" data-action="navDay" data-delta="1">›</span>
      <span class="mini-links"><span class="active">Notlar</span></span>
    </div>
    <textarea class="ruled" data-bind="dayNotes" data-date="${key}" placeholder="Bugün için notlarınızı buraya yazın...">${escapeHtml(note)}</textarea>
  `;

  const right = `
    ${pageHead(d)}
    <div class="date-row">
      <strong>Yapılacaklar</strong>
      <span class="mini-links">
        <span data-action="removeAllTodos">Tümünü Sil</span>
      </span>
    </div>
    <div class="todo-add">
      <input type="text" id="todoInput" placeholder="Yeni görev ekle, Enter'a basın" data-enter-action="todoAddSubmit" />
      <button data-action="todoAddSubmit">Ekle</button>
    </div>
    <div class="todo-list">
      ${ todos.length ? todos.map(todoItemHTML).join('') : '<div class="placeholder-note">Henüz görev yok. Yukarıdan ekleyin.</div>' }
    </div>
    <div class="cat-bar">
      <div class="cat-tabs">
        ${Object.keys(ICON_CATS).map(c => `<span class="${S.iconCategory===c?'active':''}" data-action="selectCat" data-cat="${c}">${CAT_LABELS[c]}</span>`).join('')}
      </div>
      <div class="icon-grid">
        ${ICON_CATS[S.iconCategory].map(ic => `<div class="ic ${S.selectedIcon===ic?'sel':''}" data-action="selectIcon" data-icon="${ic}">${ic}</div>`).join('')}
      </div>
    </div>
  `;
  return { left, right };
}
function todoItemHTML(t){
  return `<div class="todo-item ${t.done?'done':''}">
    <input type="checkbox" ${t.done?'checked':''} data-action="todoToggle" data-id="${t.id}">
    <span class="ico">${t.icon||'📌'}</span>
    <span class="txt">${escapeHtml(t.text)}</span>
    <span class="del" data-action="todoDelete" data-id="${t.id}">×</span>
  </div>`;
}

/* ---------------- HAFTA (WEEK) ---------------- */
function viewWeek(){
  const mon = mondayOf(S.currentDate);
  const days = Array.from({length:7}, (_,i)=>addDays(mon,i));
  const today = new Date();

  const rowHTML = (d) => {
    const key = dkey(d);
    const isToday = sameDay(d, today);
    const note = S.notes[key] || '';
    return `<div class="week-row">
      <div class="whead">
        <span class="wnum ${isToday?'today':''}">${d.getDate()}</span>
        <span>${WEEKDAYS_LONG[(d.getDay()+6)%7]}</span>
      </div>
      <textarea data-bind="dayNotes" data-date="${key}" placeholder="Not ekle...">${escapeHtml(note)}</textarea>
    </div>`;
  };

  const left = `
    ${pageHead(mon)}
    <div class="week-rows">
      ${days.slice(0,4).map(rowHTML).join('')}
    </div>
  `;
  const right = `
    ${pageHead(mon)}
    <div class="week-rows">
      ${days.slice(4,7).map(rowHTML).join('')}
    </div>
    ${miniCalendarHTML(S.currentDate.getFullYear(), S.currentDate.getMonth())}
  `;
  return { left, right };
}

function miniCalendarHTML(year, monthIndex){
  const today = new Date();
  const weeks = buildMonthWeeks(year, monthIndex);
  const rows = weeks.map(week => `<tr>${week.map(cell => {
    const cls = [];
    if(!cell.inMonth) cls.push('other');
    if(sameDay(cell.date, today)) cls.push('today');
    return `<td class="${cls.join(' ')}" data-action="jumpDate" data-date="${dkey(cell.date)}">${cell.date.getDate()}</td>`;
  }).join('')}</tr>`).join('');

  return `<div class="mini-cal">
    <div class="cal-nav">
      <span data-action="navMonth" data-delta="-1">‹‹</span>
      <span>${MONTHS_LONG[monthIndex]} ${year}</span>
      <span data-action="navMonth" data-delta="1">››</span>
    </div>
    <table>
      <thead><tr>${WEEKDAYS_SHORT.map(w=>`<th>${w}</th>`).join('')}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function buildMonthWeeks(year, monthIndex){
  const first = new Date(year, monthIndex, 1);
  const gridStart = mondayOf(first);
  const weeks = [];
  let cursor = gridStart;
  for(let w=0; w<6; w++){
    const week = [];
    for(let i=0;i<7;i++){
      week.push({ date:new Date(cursor), inMonth: cursor.getMonth()===monthIndex });
      cursor = addDays(cursor,1);
    }
    weeks.push(week);
    if(cursor.getMonth()!==monthIndex && cursor > addDays(first,27)) {
      // stop once we've wrapped fully past the month (avoid trailing empty 6th row when unnecessary)
      if(w>=3) break;
    }
  }
  return weeks;
}

/* ---------------- AY (MONTH) ---------------- */
function viewMonth(){
  const year = S.currentDate.getFullYear();
  const monthIndex = S.currentDate.getMonth();
  const weeks = buildMonthWeeks(year, monthIndex);
  const today = new Date();

  const cellHTML = (cell) => {
    const cls = [];
    if(!cell.inMonth) cls.push('other');
    if(sameDay(cell.date, today)) cls.push('today');
    const key = dkey(cell.date);
    const note = S.notes[key];
    return `<td class="${cls.join(' ')}" data-action="jumpDate" data-date="${key}">
      <div class="dnum">${cell.date.getDate()}</div>
      ${note ? `<div class="note-dot">${escapeHtml(note.slice(0,16))}</div>` : ''}
    </td>`;
  };

  const leftRows = weeks.map((week,wi) => {
    const colorKey = `${year}-${monthIndex}-${wi}`;
    const color = S.monthProjColors[colorKey] || '#e7ded0';
    return `<tr>
      <td class="proj-col"><div class="proj-swatch" style="background:${color}" data-action="cycleWeekColor" data-weekkey="${colorKey}"></div></td>
      ${week.slice(0,3).map(cellHTML).join('')}
    </tr>`;
  }).join('');

  const rightRows = weeks.map(week => `<tr>${week.slice(3,7).map(cellHTML).join('')}</tr>`).join('');

  const left = `
    ${pageHead(S.currentDate)}
    <table class="month-table">
      <thead><tr><th class="proj-col"></th><th>Pzt</th><th>Sal</th><th>Çar</th></tr></thead>
      <tbody>${leftRows}</tbody>
    </table>
  `;

  const right = `
    ${pageHead(S.currentDate)}
    <table class="month-table">
      <thead><tr><th>Per</th><th>Cum</th><th>Cmt</th><th>Paz</th></tr></thead>
      <tbody>${rightRows}</tbody>
    </table>
    <div class="month-foot">
      <span class="yr-nav" data-action="navYearCtx" data-delta="-1" data-ctx="month">« ${year}</span>
      <span class="yr-nav" data-action="navYearCtx" data-delta="1" data-ctx="month">${year} »</span>
    </div>
    <div class="month-grid-names">
      ${MONTHS_SHORT.map((m,i)=>`<span class="${i===monthIndex?'active':''}" data-action="jumpMonth" data-month="${i}">${m}</span>`).join('')}
    </div>
  `;
  return { left, right };
}

/* ---------------- PROJELER (PROJECTS) ---------------- */
function viewProjects(){
  const activeId = S.activeProjectId;
  const tabsHTML = [
    `<div class="proj-tab ${activeId==='overview'?'active':''}" style="background:#d8cfa8" data-action="selectProject" data-id="overview">Genel Bakış</div>`,
    ...S.projects.map(p => `<div class="proj-tab ${activeId===p.id?'active':''}" style="background:${p.color}55" data-action="selectProject" data-id="${p.id}">${escapeHtml(p.name)}</div>`)
  ].join('');

  let bodyHTML;
  if(activeId === 'overview'){
    bodyHTML = `<div class="placeholder-note" style="margin-bottom:10px;">Tüm projelerinize genel bir bakış.</div>
      ${S.projects.map(p=>`<div class="proj-list-item"><div class="sw" style="background:${p.color}"></div><div style="flex:1"><div><strong>${escapeHtml(p.name)}</strong></div><div class="mini-links" style="margin-left:0;color:var(--ink-soft);font-size:11.5px;">${p.notes ? escapeHtml(p.notes.slice(0,60)) : 'Not yok'}</div></div></div>`).join('')}`;
  } else {
    const proj = S.projects.find(p=>p.id===activeId);
    bodyHTML = proj ? `<textarea class="ruled" style="flex:1" data-bind="projNotes" data-id="${proj.id}" placeholder="Bu proje için notlarınızı yazın...">${escapeHtml(proj.notes)}</textarea>` : '';
  }

  const left = `
    ${pageHead(S.currentDate)}
    <div class="proj-shell">
      <div class="proj-tabs">${tabsHTML}</div>
      <div class="proj-body">${bodyHTML}</div>
    </div>
  `;

  const right = `
    ${pageHead(S.currentDate)}
    <strong style="margin-bottom:8px;display:block;">Tüm Projeler</strong>
    <div class="todo-list">
      ${S.projects.map(p => `<div class="proj-list-item">
        <div class="sw" style="background:${p.color}"></div>
        <div style="flex:1"><strong>${escapeHtml(p.name)}</strong></div>
        <span class="del" data-action="deleteProject" data-id="${p.id}">×</span>
      </div>`).join('')}
    </div>
    <div class="proj-new">
      <input type="text" id="newProjName" placeholder="Yeni proje adı" data-enter-action="addProjectSubmit" />
      <input type="color" id="newProjColor" value="${PROJECT_PALETTE[S.projects.length % PROJECT_PALETTE.length]}" />
      <button data-action="addProjectSubmit">Ekle</button>
    </div>
  `;
  return { left, right };
}

/* ---------------- BİLGİ (INFO) ---------------- */
function viewInfo(){
  const left = `
    ${pageHead(S.currentDate)}
    <div class="brand-mark">
      <div class="glyph">A</div>
      <div class="word">Ajanda</div>
      <div class="ver">sürüm 1.0</div>
    </div>
    <div class="info-tag">Günlerinizi, haftalarınızı, aylarınızı ve projelerinizi tek bir yerde, deri ciltli bir defter havasında toplayın.</div>

    <div class="backup-box">
      <strong style="font-size:12.5px;">Verilerinizi Yedekleyin</strong>
      <div class="info-tag" style="margin:4px 0 8px;">USB bellekte taşımak için verinizi bir dosyaya kaydedin; başka bir bilgisayarda bu dosyayı geri yükleyin.</div>
      <div class="backup-btns">
        <button data-action="exportData">💾 Dışa Aktar</button>
        <button data-action="importTrigger">📂 İçe Aktar</button>
        <input type="file" id="importFileInput" accept="application/json,.json" data-role="importFile" style="display:none;">
      </div>
      <div id="backupStatus" class="backup-status"></div>
    </div>
  `;

  const year = S.currentDate.getFullYear();
  const grid = MONTHS_LONG.map((m,mi) => `<div class="ymonth">
      <div class="yname" data-action="jumpMonth" data-month="${mi}" style="cursor:pointer;">${m}</div>
      ${miniMonthTable(year, mi)}
    </div>`).join('');

  const right = `
    ${pageHead(S.currentDate)}
    <div class="year-head">
      <span class="nv" data-action="navYearCtx" data-delta="-1" data-ctx="info">‹ Önceki Yıl</span>
      <span>${year}</span>
      <span class="nv" data-action="navYearCtx" data-delta="1" data-ctx="info">Sonraki Yıl ›</span>
    </div>
    <div class="year-grid">${grid}</div>
  `;
  return { left, right };
}
function miniMonthTable(year, monthIndex){
  const today = new Date();
  const weeks = buildMonthWeeks(year, monthIndex);
  const rows = weeks.map(week => `<tr>${week.map(cell=>{
    if(!cell.inMonth) return `<td class="other">${cell.date.getDate()}</td>`;
    const cls = sameDay(cell.date, today) ? 'today' : '';
    return `<td class="${cls}" data-action="jumpDate" data-date="${dkey(cell.date)}">${cell.date.getDate()}</td>`;
  }).join('')}</tr>`).join('');
  return `<table><thead><tr>${WEEKDAYS_INITIAL.map(w=>`<th>${w}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
}

/* ---------------- ADRES (ADDRESS) ---------------- */
function viewAddress(){
  const q = S.contactSearch.trim().toLowerCase();
  const list = S.contacts.filter(c => !q || c.name.toLowerCase().includes(q));

  const left = `
    ${pageHead(S.currentDate)}
    <div class="addr-search">
      <input type="text" placeholder="Kişi ara..." value="${escapeHtml(S.contactSearch)}" data-bind="contactSearch" />
    </div>
    <div class="todo-list">
      ${ list.length ? list.map(c => `<div class="contact-card">
          <div><div class="nm">${escapeHtml(c.name)}</div><div class="meta">${escapeHtml(c.phone||'')} ${c.email?('· '+escapeHtml(c.email)):''}</div></div>
          <span class="del" data-action="deleteContact" data-id="${c.id}">×</span>
        </div>`).join('') : '<div class="placeholder-note">Kişi bulunamadı.</div>' }
    </div>
  `;

  const right = `
    ${pageHead(S.currentDate)}
    <strong>Yeni Kişi Ekle</strong>
    <div class="addr-form">
      <input type="text" id="cName" placeholder="Ad Soyad" />
      <input type="text" id="cPhone" placeholder="Telefon" />
      <input type="text" id="cEmail" placeholder="E-posta" style="grid-column:1/-1;" />
      <button data-action="addContactSubmit">Kaydet</button>
    </div>
  `;
  return { left, right };
}

/* ---------------- ÖZELLEŞTİR (CUSTOMIZE) ---------------- */
function viewCustomize(){
  const left = `
    ${pageHead(S.currentDate)}
    <div class="brand-mark">
      <div class="glyph" style="background:${COVER_OPTIONS.find(c=>c.id===S.cover).bg}">A</div>
      <div class="word">Kapak Galerisi</div>
    </div>
    <div class="info-tag">Defterinizin dış kapağını beğeninize göre değiştirin. Seçiminiz anında uygulanır.</div>
  `;

  const subtabs = ['kapaklar','simgeler','hesaplayici','mp3','hizliresim','haritalar'];
  const subLabels = { kapaklar:'Kapaklar', simgeler:'Simgeler', hesaplayici:'Hesap Makinesi', mp3:'Mp3', hizliresim:'HızlıResim', haritalar:'Haritalar' };

  let panel;
  if(S.custSubtab === 'kapaklar'){
    panel = `<div class="cover-grid">
      ${COVER_OPTIONS.map(c => `<div>
        <div class="cover-swatch ${S.cover===c.id?'sel':''}" style="background:${c.bg}" data-action="selectCover" data-cover="${c.id}"><div class="stud"></div></div>
        <div class="cover-label">${c.name}</div>
      </div>`).join('')}
    </div>`;
  } else {
    panel = `<div class="placeholder-note">Bu bölüm yakında eklenecek.</div>`;
  }

  const right = `
    ${pageHead(S.currentDate)}
    <div class="cust-subtabs">
      ${subtabs.map(t => `<span class="${S.custSubtab===t?'active':''}" data-action="custSubtab" data-tab="${t}">${subLabels[t]}</span>`).join('')}
    </div>
    ${panel}
  `;
  return { left, right };
}

/* ============================================================
   YÜZEN ARAÇLAR (Hesap Makinesi / Mp3 / HızlıResim)
   ============================================================ */
function renderFloatingTool(){
  if(!S.activeTool){ floatingToolEl.className='floating-tool'; floatingToolEl.innerHTML=''; return; }
  floatingToolEl.className = 'floating-tool show';
  if(S.activeTool==='calculator') floatingToolEl.innerHTML = calcHTML();
  else if(S.activeTool==='mp3') floatingToolEl.innerHTML = mp3HTML();
  else if(S.activeTool==='quikpix') floatingToolEl.innerHTML = quikpixHTML();
}

/* --- Hesap Makinesi --- */
function calcHTML(){
  const keys = [
    ['MC','MR','M+','M-'],
    ['C','±','÷','×'],
    ['7','8','9','−'],
    ['4','5','6','+'],
    ['1','2','3','='],
    ['0','.']
  ];
  let rows = '';
  rows += `<button class="op" data-action="calcMem" data-mem="mc">MC</button><button class="op" data-action="calcMem" data-mem="mr">MR</button><button class="op" data-action="calcMem" data-mem="mplus">M+</button><button class="op" data-action="calcMem" data-mem="mminus">M-</button>`;
  rows += `<button class="op" data-action="calcClear">C</button><button class="op" data-action="calcSign">±</button><button class="op" data-action="calcOp" data-op="÷">÷</button><button class="op" data-action="calcOp" data-op="×">×</button>`;
  rows += `<button data-action="calcDigit" data-d="7">7</button><button data-action="calcDigit" data-d="8">8</button><button data-action="calcDigit" data-d="9">9</button><button class="op" data-action="calcOp" data-op="−">−</button>`;
  rows += `<button data-action="calcDigit" data-d="4">4</button><button data-action="calcDigit" data-d="5">5</button><button data-action="calcDigit" data-d="6">6</button><button class="op" data-action="calcOp" data-op="+">+</button>`;
  rows += `<button data-action="calcDigit" data-d="1">1</button><button data-action="calcDigit" data-d="2">2</button><button data-action="calcDigit" data-d="3">3</button><button class="eq" data-action="calcEquals">=</button>`;
  rows += `<button class="zero" data-action="calcDigit" data-d="0">0</button><button data-action="calcDot">.</button>`;

  return `
    <div class="ft-head"><strong>Hesap Makinesi</strong><span class="ft-btn" data-action="closeTool">×</span></div>
    <div class="calc-screen">${escapeHtml(S.calc.display)}</div>
    <div class="calc-grid">${rows}</div>
  `;
}
function calcInputDigit(d){
  const c = S.calc;
  if(c.resetNext || c.display==='0'){ c.display = d; c.resetNext=false; }
  else if(c.display.length<14){ c.display += d; }
}
function calcInputDot(){
  const c = S.calc;
  if(c.resetNext){ c.display='0.'; c.resetNext=false; return; }
  if(!c.display.includes('.')) c.display += '.';
}
function calcApplyOp(op){
  const c = S.calc;
  const cur = parseFloat(c.display);
  if(c.prev!=null && c.op && !c.resetNext){
    c.prev = calcCompute(c.prev, cur, c.op);
    c.display = formatCalc(c.prev);
  } else {
    c.prev = cur;
  }
  c.op = op;
  c.resetNext = true;
}
function calcCompute(a,b,op){
  switch(op){
    case '+': return a+b;
    case '−': return a-b;
    case '×': return a*b;
    case '÷': return b===0 ? 0 : a/b;
    default: return b;
  }
}
function formatCalc(n){
  let s = String(Math.round(n*1e10)/1e10);
  if(s.length>14) s = n.toExponential(6);
  return s;
}
function calcEquals(){
  const c = S.calc;
  if(c.op==null) return;
  const cur = parseFloat(c.display);
  c.prev = calcCompute(c.prev, cur, c.op);
  c.display = formatCalc(c.prev);
  c.op = null; c.resetNext = true;
}
function calcClear(){
  S.calc.display='0'; S.calc.prev=null; S.calc.op=null; S.calc.resetNext=false;
}
function calcSign(){
  const c = S.calc;
  if(c.display!=='0') c.display = c.display.startsWith('-') ? c.display.slice(1) : '-'+c.display;
}
function calcMem(mode){
  const c = S.calc;
  const cur = parseFloat(c.display)||0;
  if(mode==='mc') c.mem = 0;
  else if(mode==='mr'){ c.display = formatCalc(c.mem); c.resetNext=true; }
  else if(mode==='mplus') c.mem += cur;
  else if(mode==='mminus') c.mem -= cur;
}

/* --- Mp3 Çalar (arayüz simülasyonu) --- */
let mp3Timer = null;
function mp3HTML(){
  const m = S.mp3;
  return `
    <div class="ft-head"><strong>Mp3 Çalar</strong><span class="ft-btn" data-action="closeTool">×</span></div>
    <div class="mp3-track">${escapeHtml(m.playlist[m.trackIndex])}</div>
    <div class="mp3-progress"><i style="width:${m.progress}%"></i></div>
    <div class="mp3-controls">
      <button data-action="mp3Prev">⏮</button>
      <button class="play" data-action="mp3Toggle">${m.playing?'⏸':'▶'}</button>
      <button data-action="mp3Next">⏭</button>
    </div>
    <div class="mp3-vol">🔈<input type="range" min="0" max="1" step="0.05" value="${m.volume}" data-bind="mp3Vol"> 🔊</div>
  `;
}
function mp3StartTimer(){
  clearInterval(mp3Timer);
  mp3Timer = setInterval(()=>{
    if(!S.mp3.playing) return;
    S.mp3.progress += 1.5;
    if(S.mp3.progress>=100){ S.mp3.progress=0; mp3Next(); }
    renderFloatingTool();
  }, 300);
}
function mp3Next(){ S.mp3.trackIndex = (S.mp3.trackIndex+1)%S.mp3.playlist.length; S.mp3.progress=0; renderFloatingTool(); }
function mp3Prev(){ S.mp3.trackIndex = (S.mp3.trackIndex-1+S.mp3.playlist.length)%S.mp3.playlist.length; S.mp3.progress=0; renderFloatingTool(); }

/* --- HızlıResim (bellek oyunu) --- */
let audioCtx = null;
function beep(freq, dur){
  if(S.quikpix.muted) return;
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.value = S.quikpix.volume * 0.3;
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur/1000);
  }catch(e){ /* sessizce geç */ }
}
function quikpixHTML(){
  const q = S.quikpix;
  const tiles = QP_ICONS.map((ic,i) => `<div class="qp-tile" data-action="qpTile" data-idx="${i}" id="qpTile${i}">${ic}</div>`).join('');
  return `
    <div class="ft-head"><strong>HızlıResim</strong><span class="ft-btn" data-action="closeTool">×</span></div>
    <div class="qp-grid">${tiles}</div>
    <div class="qp-stats">
      <div><span>Bu turdaki puan</span><span>${q.score}</span></div>
      <div><span>En iyi skor</span><span>${q.best}</span></div>
      <div><span>Tur</span><span>${q.round}</span></div>
    </div>
    <div class="qp-controls">
      <button data-action="qpStart">${q.playing?'Yeniden Başlat':'Başlat'}</button>
      <button data-action="qpMute">${q.muted?'🔇':'🔊'}</button>
      <button data-action="qpVol" data-delta="-0.1">Ses −</button>
      <button data-action="qpVol" data-delta="0.1">Ses +</button>
    </div>
  `;
}
function qpStart(){
  const q = S.quikpix;
  q.sequence = [Math.floor(Math.random()*9)];
  q.userStep = 0; q.round = 1; q.score = 0; q.playing = true;
  renderFloatingTool();
  qpPlaySequence();
}
function qpPlaySequence(){
  const q = S.quikpix;
  q.showing = true;
  let i = 0;
  const step = () => {
    if(i>0){
      const prevIdx = q.sequence[i-1];
      const prevEl = document.getElementById('qpTile'+prevIdx);
      if(prevEl) prevEl.classList.remove('flash');
    }
    if(i>=q.sequence.length){ q.showing=false; return; }
    const idx = q.sequence[i];
    const el = document.getElementById('qpTile'+idx);
    if(el) el.classList.add('flash');
    beep(220+idx*45, 220);
    i++;
    setTimeout(step, 480);
  };
  setTimeout(step, 400);
}
function qpTileClick(idx){
  const q = S.quikpix;
  if(!q.playing || q.showing) return;
  beep(220+idx*45, 150);
  if(idx === q.sequence[q.userStep]){
    q.userStep++;
    if(q.userStep === q.sequence.length){
      q.round++;
      q.score += 100*(q.round-1);
      if(q.score>q.best) q.best = q.score;
      q.userStep = 0;
      q.sequence.push(Math.floor(Math.random()*9));
      renderFloatingTool();
      qpPlaySequence();
      return;
    }
  } else {
    q.playing = false;
    if(q.score>q.best) q.best = q.score;
  }
  renderFloatingTool();
}

/* ============================================================
   OLAY YÖNETİMİ (event delegation)
   ============================================================ */
document.body.addEventListener('click', (e) => {
  const t = e.target.closest('[data-action]');
  if(!t) return;
  const ds = t.dataset;
  switch(ds.action){
    case 'setView':
      S.view = ds.view;
      renderAll();
      break;
    case 'openTool':
      S.activeTool = (S.activeTool===ds.tool) ? null : ds.tool;
      renderFloatingTool();
      if(S.activeTool==='mp3') mp3StartTimer();
      break;
    case 'closeTool':
      S.activeTool = null;
      renderFloatingTool();
      break;
    case 'navDay':
      S.currentDate = addDays(S.currentDate, parseInt(ds.delta,10));
      renderAll();
      break;
    case 'navMonth':
      S.currentDate = addMonths(S.currentDate, parseInt(ds.delta,10));
      renderAll();
      break;
    case 'navYearCtx':
      S.currentDate = addYears(S.currentDate, parseInt(ds.delta,10));
      renderAll();
      break;
    case 'jumpMonth':
      S.currentDate = new Date(S.currentDate.getFullYear(), parseInt(ds.month,10), 1);
      renderAll();
      break;
    case 'jumpDate':
      S.currentDate = new Date(ds.date+'T00:00:00');
      S.view = 'day';
      renderAll();
      break;

    case 'todoToggle': {
      const key = dkey(S.currentDate);
      const list = S.todos[key]||[];
      const item = list.find(x=>x.id===ds.id);
      if(item) item.done = !item.done;
      renderPages();
      break;
    }
    case 'todoDelete': {
      const key = dkey(S.currentDate);
      S.todos[key] = (S.todos[key]||[]).filter(x=>x.id!==ds.id);
      renderPages();
      break;
    }
    case 'todoAddSubmit': {
      const input = document.getElementById('todoInput');
      const text = input ? input.value.trim() : '';
      if(text){
        const key = dkey(S.currentDate);
        if(!S.todos[key]) S.todos[key]=[];
        S.todos[key].push({ id:uid(), text, done:false, icon:S.selectedIcon });
      }
      renderPages();
      const ni = document.getElementById('todoInput');
      if(ni) ni.focus();
      break;
    }
    case 'removeAllTodos': {
      S.todos[dkey(S.currentDate)] = [];
      renderPages();
      break;
    }
    case 'selectIcon':
      S.selectedIcon = ds.icon;
      renderPages();
      break;
    case 'selectCat':
      S.iconCategory = ds.cat;
      renderPages();
      break;

    case 'cycleWeekColor': {
      const cur = S.monthProjColors[ds.weekkey];
      const idx = PROJECT_PALETTE.indexOf(cur);
      S.monthProjColors[ds.weekkey] = PROJECT_PALETTE[(idx+1)%PROJECT_PALETTE.length];
      renderPages();
      break;
    }

    case 'selectProject':
      S.activeProjectId = ds.id;
      renderPages();
      break;
    case 'deleteProject':
      S.projects = S.projects.filter(p=>p.id!==ds.id);
      if(S.activeProjectId===ds.id) S.activeProjectId='overview';
      renderPages();
      break;
    case 'addProjectSubmit': {
      const nameEl = document.getElementById('newProjName');
      const colorEl = document.getElementById('newProjColor');
      const name = nameEl ? nameEl.value.trim() : '';
      if(name){
        S.projects.push({ id:uid(), name, color: colorEl?colorEl.value:'#999', notes:'' });
      }
      renderPages();
      break;
    }

    case 'addContactSubmit': {
      const n = document.getElementById('cName');
      const p = document.getElementById('cPhone');
      const em = document.getElementById('cEmail');
      const name = n?n.value.trim():'';
      if(name){
        S.contacts.push({ id:uid(), name, phone:p?p.value.trim():'', email:em?em.value.trim():'' });
      }
      renderPages();
      break;
    }
    case 'deleteContact':
      S.contacts = S.contacts.filter(c=>c.id!==ds.id);
      renderPages();
      break;

    case 'selectCover':
      S.cover = ds.cover;
      renderAll();
      break;
    case 'custSubtab':
      S.custSubtab = ds.tab;
      renderPages();
      break;

    /* hesap makinesi */
    case 'calcDigit': calcInputDigit(ds.d); renderFloatingTool(); break;
    case 'calcDot': calcInputDot(); renderFloatingTool(); break;
    case 'calcOp': calcApplyOp(ds.op); renderFloatingTool(); break;
    case 'calcEquals': calcEquals(); renderFloatingTool(); break;
    case 'calcClear': calcClear(); renderFloatingTool(); break;
    case 'calcSign': calcSign(); renderFloatingTool(); break;
    case 'calcMem': calcMem(ds.mem); renderFloatingTool(); break;

    /* mp3 */
    case 'mp3Toggle':
      S.mp3.playing = !S.mp3.playing;
      renderFloatingTool();
      break;
    case 'mp3Next': mp3Next(); break;
    case 'mp3Prev': mp3Prev(); break;

    /* quikpix */
    case 'qpStart': qpStart(); break;
    case 'qpMute': S.quikpix.muted = !S.quikpix.muted; renderFloatingTool(); break;
    case 'qpVol':
      S.quikpix.volume = Math.min(1, Math.max(0, S.quikpix.volume + parseFloat(ds.delta)));
      renderFloatingTool();
      break;
    case 'qpTile': qpTileClick(parseInt(ds.idx,10)); break;

    case 'exportData':
      exportData();
      break;
    case 'importTrigger': {
      const fi = document.getElementById('importFileInput');
      if(fi) fi.click();
      break;
    }

    case 'quickAdd':
      S.view = 'day';
      renderAll();
      setTimeout(()=>{ const ni=document.getElementById('todoInput'); if(ni) ni.focus(); }, 0);
      break;
    case 'help':
      alert('Ajanda\n\nSol/sağ sekmelerden görünüm değiştirin.\nOrtadaki cilt mandalından Hesap Makinesi, Mp3 Çalar ve HızlıResim oyununu açın.\n"Özelleştir" ile kapak rengini değiştirin.');
      break;
    case 'close':
      try{ window.close(); }catch(e){}
      break;
  }
});

/* input / değişiklik olayları (yeniden çizmeden veriyi güncelle) */
document.body.addEventListener('input', (e) => {
  const el = e.target;
  const bind = el.dataset.bind;
  if(!bind) return;
  if(bind==='dayNotes'){
    S.notes[el.dataset.date] = el.value;
  } else if(bind==='projNotes'){
    const proj = S.projects.find(p=>p.id===el.dataset.id);
    if(proj) proj.notes = el.value;
  } else if(bind==='contactSearch'){
    S.contactSearch = el.value;
    renderPages();
  } else if(bind==='mp3Vol'){
    S.mp3.volume = parseFloat(el.value);
    return; // mp3 durumu yedeklenmez
  }
  scheduleSave();
});

/* dosya seçildiğinde (İçe Aktar) */
document.body.addEventListener('change', (e) => {
  const el = e.target;
  if(el.matches('input[type=file][data-role="importFile"]') && el.files && el.files[0]){
    importDataFromFile(el.files[0]);
    el.value = '';
  }
});

/* Enter tuşu ile gönderim */
document.body.addEventListener('keydown', (e) => {
  if(e.key !== 'Enter') return;
  const el = e.target;
  if(el.dataset && el.dataset.enterAction){
    const t = document.querySelector(`[data-action="${el.dataset.enterAction}"]`);
    if(t) t.click();
  }
});

/* saat göstergesini canlı tut (tam yeniden çizim yapmadan) */
setInterval(() => {
  document.querySelectorAll('.clock').forEach(el => { el.textContent = timeNow(); });
}, 15000);

/* ---------- başlangıç ---------- */
renderAll();

/* geliştirici/hata ayıklama erişimi (isteğe bağlı) */
if (typeof window !== 'undefined') { window.APP_STATE = S; }
