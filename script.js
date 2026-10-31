
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const STORAGE_KEYS = { official: 'asc_official_v2', community: 'asc_community_v2' };

// --- State
let official = JSON.parse(localStorage.getItem(STORAGE_KEYS.official) || '[]');
let community = JSON.parse(localStorage.getItem(STORAGE_KEYS.community) || '[]');

// Seed if empty
if(official.length===0){
  official = [
    {id:'off1', name:'ARIRANG focus - SWIM heavy', url:'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd', duration:85, swim:8, normal:3, come:1, bsides:2, swimVersions:['SWIM Original','SWIM Remix','SWIM Live'], status:'approved'},
    {id:'off2', name:'ARIRANG Morning - NORMAL mix', url:'https://open.spotify.com/playlist/37i9dQZF1DWSl3W1oO9z3K', duration:62, swim:3, normal:6, come:1, bsides:1, swimVersions:['SWIM Original'], status:'approved'},
    {id:'off3', name:'ARIRANG OT7 full', url:'https://open.spotify.com/playlist/37i9dQZF1DX3XjJq5kqS4R', duration:120, swim:10, normal:8, come:3, bsides:5, swimVersions:['SWIM','SWIM 2.0','SWIM Merry Go Round'], status:'approved'},
  ];
  save();
}
function save(){
  localStorage.setItem(STORAGE_KEYS.official, JSON.stringify(official));
  localStorage.setItem(STORAGE_KEYS.community, JSON.stringify(community));
}

// --- Navigation
$$('[data-view]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const view = btn.dataset.view;
    if(!view) return;
    $$('.view').forEach(v=>v.classList.remove('active'));
    const target = document.getElementById(view);
    if(target) target.classList.add('active');
    $$('.nav-link, .mobile-nav button').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
    window.scrollTo({top:0, behavior:'smooth'});
  });
});
$$('[data-go]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const v=btn.dataset.go;
    document.querySelector(`[data-view="${v}"]`)?.click();
  });
});
$('#menuToggle')?.addEventListener('click', ()=>$('#mainNav').classList.toggle('open'));

// --- Forms
function parseVersions(str){ return str.split(',').map(s=>s.trim()).filter(Boolean); }

function handleForm(form, collectionName, status){
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const data = new FormData(form);
    const item = {
      id: Date.now().toString(36),
      name: data.get('name'),
      url: data.get('url'),
      duration: parseInt(data.get('duration')||0),
      swim: parseInt(data.get('swim')||0),
      normal: parseInt(data.get('normal')||0),
      come: parseInt(data.get('come')||0),
      bsides: parseInt(data.get('bsides')||0),
      swimVersions: parseVersions(data.get('swimVersions')||''),
      status: status
    };
    if(collectionName==='official') official.unshift(item); else community.unshift(item);
    save(); renderAll(); form.reset();
    if(collectionName==='community'){
      const msg = document.getElementById('communityMessage');
      if(msg){ msg.textContent='¡Gracias! Tu aporte quedó pendiente de revisión ♡'; setTimeout(()=>msg.textContent='',3000); }
    }
  });
}
const offForm = document.getElementById('officialForm');
const comForm = document.getElementById('communityForm');
if(offForm) handleForm(offForm,'official','approved');
if(comForm) handleForm(comForm,'community','pending');

// --- Render
function playlistCardHTML(p){
  const versions = p.swimVersions?.length ? `<div class="meta">${p.swimVersions.map(v=>`<span class="pill">${v}</span>`).join('')}</div>` : '';
  return `<article class="playlist-card">
    <strong>${p.name}</strong>
    <small>${p.duration} min • SWIM:${p.swim} NORMAL:${p.normal} COME:${p.come} B-sides:${p.bsides}</small>
    ${versions}
    <div class="actions">
      <a class="button" href="${p.url}" target="_blank">Abrir en Spotify →</a>
      ${p.status==='pending'?'<span class="pill">Pendiente revisión</span>':''}
    </div>
  </article>`;
}
function renderLists(){
  const offList = document.getElementById('officialList');
  const comList = document.getElementById('communityList');
  const offCount = document.getElementById('officialCount');
  const comCount = document.getElementById('communityCount');
  if(offList){ offList.innerHTML = official.map(playlistCardHTML).join('') || '<p class="notice">Aún no hay playlists oficiales. Registra la primera arriba.</p>'; }
  if(comList){ 
    const approvedForCombos = community.filter(c=>c.status==='approved');
    const toShow = community; // show all
    comList.innerHTML = toShow.map(playlistCardHTML).join('') || '<p class="notice">Sé la primera en compartir ♡</p>'; 
  }
  if(offCount) offCount.textContent = `${official.length} playlists`;
  if(comCount) comCount.textContent = `${community.length} aportes`;
}
function renderGoals(){
  const board = document.getElementById('goalBoard');
  const home = document.getElementById('homeGoals');
  const goals = [
    {k:'SWIM', v:120, note:'6 lanzamientos • Prioridad máxima', icon:'♡'},
    {k:'NORMAL', v:80, note:'4 lanzamientos • Prioridad alta', icon:'♫'},
    {k:'COME OVER', v:20, note:'1 lanzamiento • Rotación', icon:'✧'},
    {k:'B-sides', v:50, note:'Catálogo por completar', icon:'🦋'},
  ];
  const html = goals.map(g=>`<article class="goal-card"><div class="combo-top"><span><b>${g.icon} ${g.k}</b> — ${g.v} repeticiones</span><span class="badge">Meta</span></div><small>${g.note}</small><div style="margin-top:10px;background:#f3e8ff;height:8px;border-radius:999px;overflow:hidden"><div style="width:${Math.min(90, g.v/2)}%;height:100%;background:#7a5cfa"></div></div></article>`).join('');
  if(board) board.innerHTML = html;
  if(home) home.innerHTML = goals.slice(0,2).map(g=>`<article class="stat-card"><span class="stat-icon">${g.icon}</span><div><strong>${g.k}: ${g.v}</strong><small>${g.note}</small></div></article>`).join('');
}
function renderAll(){ renderLists(); renderGoals(); }
renderAll();

// --- Combos logic
const timeSelect = document.getElementById('timeSelect');
const customLabel = document.getElementById('customTimeLabel');
const customInput = document.getElementById('customTime');

timeSelect?.addEventListener('change', ()=>{
  customLabel?.classList.toggle('hidden', timeSelect.value!=='custom');
});

function getAvailableTime(){
  if(timeSelect.value==='custom') return parseInt(customInput.value||0);
  return parseInt(timeSelect.value);
}

function scoreCombination(combo, goals){
  // score = how close to goals + time efficiency
  let totalSwim = combo.reduce((a,c)=>a+c.swim,0);
  let totalNormal = combo.reduce((a,c)=>a+c.normal,0);
  let totalCome = combo.reduce((a,c)=>a+c.come,0);
  let s = 0;
  s += Math.min(totalSwim, goals.swim) / goals.swim;
  s += Math.min(totalNormal, goals.normal) / goals.normal;
  s += Math.min(totalCome, goals.come) / goals.come;
  return s;
}

document.getElementById('calculateButton')?.addEventListener('click', ()=>{
  const source = document.getElementById('comboSource').value;
  const time = getAvailableTime();
  const goals = {
    swim: parseInt(document.getElementById('goalSwim').value||0),
    normal: parseInt(document.getElementById('goalNormal').value||0),
    come: parseInt(document.getElementById('goalCome').value||0),
  };
  let pool = source==='official' ? official : community.filter(c=>c.status!=='pending' || true); // allow all for demo
  // If community pool empty for demo, use official
  if(pool.length===0) pool = official;

  // Generate combos of 1-3
  let combos = [];
  for(let i=0;i<pool.length;i++){
    combos.push([pool[i]]);
    for(let j=i+1;j<pool.length;j++){
      combos.push([pool[i], pool[j]]);
      for(let k=j+1;k<pool.length;k++){
        if(pool.length>6 && combos.length>120) break;
        combos.push([pool[i], pool[j], pool[k]]);
      }
    }
  }
  // filter by time 85% - 115%
  const min = time*0.85, max = time*1.15;
  let viable = combos.filter(c=>{
    const dur = c.reduce((a,b)=>a+b.duration,0);
    return dur>=min && dur<=max;
  });
  if(viable.length===0){
    // fallback: closest time
    viable = combos.map(c=>({c, diff: Math.abs(c.reduce((a,b)=>a+b.duration,0)-time)}))
      .sort((a,b)=>a.diff-b.diff).slice(0,6).map(x=>x.c);
  }
  viable = viable.sort((a,b)=> scoreCombination(b,goals) - scoreCombination(a,goals)).slice(0,6);

  const results = document.getElementById('comboResults');
  if(viable.length===0){
    results.innerHTML = '<p class="notice">No hay combinaciones que encajen. Intenta registrar más playlists o ajustar el tiempo ♡</p>';
    return;
  }
  results.innerHTML = viable.map((combo, idx)=>{
    const dur = combo.reduce((a,b)=>a+b.duration,0);
    const ts = combo.reduce((a,b)=>a+b.swim,0);
    const tn = combo.reduce((a,b)=>a+b.normal,0);
    const tc = combo.reduce((a,b)=>a+b.come,0);
    const score = scoreCombination(combo, goals);
    return `<article class="playlist-card combo-card">
      <div class="combo-top"><strong>Combo #${idx+1} — ${dur} min</strong><span class="badge">${Math.round(score*33)}% match</span></div>
      <small>SWIM ${ts}/${goals.swim} • NORMAL ${tn}/${goals.normal} • COME OVER ${tc}/${goals.come}</small>
      <div class="meta" style="margin-top:10px">${combo.map(p=>`<span class="pill">${p.name} (${p.duration}m)</span>`).join('')}</div>
      <div class="actions">${combo.map(p=>`<a class="button" href="${p.url}" target="_blank">${p.name.slice(0,18)}… →</a>`).join('')}</div>
    </article>`;
  }).join('');

  // confetti effect
  results.scrollIntoView({behavior:'smooth'});
});
