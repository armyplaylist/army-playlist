
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

// --- MOCK DATA DISCOGRAFIA BTS + ARIRANG ---
const discography = [
  {id:'arirang', title:'ARIRANG', year:2026, era:'arirang', type:'Álbum prioritario', color:'#d8c2ff', tracks:['SWIM','NORMAL','COME OVER','Hooligan','Aliens','FYA','2.0','no.29','Merry Go Round',"they don't know 'bout us",'One More Night','Please','Into the Sun']},
  {id:'proof', title:'Proof', year:2022, era:'solo', type:'Anthology', color:'#ffe6f0', tracks:['Yet To Come','Run BTS','For Youth','Born Singer']},
  {id:'be', title:'BE', year:2020, era:'be', type:'Álbum', color:'#e6f0ff', tracks:['Life Goes On','Dynamite','Blue & Grey','Stay']},
  {id:'mots7', title:'MAP OF THE SOUL: 7', year:2020, era:'mots', type:'Álbum', color:'#fff0e6', tracks:['ON','Black Swan','Louder than bombs','We are Bulletproof: the Eternal']},
  {id:'ly_answer', title:'LOVE YOURSELF: Answer', year:2018, era:'ly', type:'Álbum', color:'#f0ffe6', tracks:['IDOL','Epiphany','Euphoria','Answer: Love Myself']},
  {id:'wings', title:'WINGS', year:2016, era:'wings', type:'Álbum', color:'#e6fff8', tracks:['Blood Sweat & Tears','Begin','Stigma','MAMA']},
  {id:'hyyh', title:'The Most Beautiful Moment in Life: Young Forever', year:2016, era:'hyyh', type:'Compilación', color:'#f5e6ff', tracks:['Fire','Save ME','Epilogue: Young Forever','Butterfly']},
  {id:'darkwild', title:'Dark & Wild', year:2014, era:'debut', type:'Álbum', color:'#fffbe6', tracks:['Danger','War of Hormone','Rain']},
];

// --- MOCK PLAYLISTS (con canciones contenidas)
let official = JSON.parse(localStorage.getItem('asc_official_v3')||'null') || [
  {id:'o1', name:'ARIRANG focus - SWIM heavy', duration:85, tracks:['SWIM','NORMAL','Merry Go Round','FYA'], url:'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd'},
  {id:'o2', name:'BTS Classics - Wings to BE', duration:120, tracks:['Dynamite','Blood Sweat & Tears','IDOL','Life Goes On','Yet To Come'], url:'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd'},
  {id:'o3', name:'HYYH Gym Hype', duration:62, tracks:['Fire','Save ME','ON','IDOL','Run BTS'], url:'https://open.spotify.com/playlist/xyz'},
];
let community = JSON.parse(localStorage.getItem('asc_community_v3')||'[]');

function save(){ localStorage.setItem('asc_official_v3', JSON.stringify(official)); localStorage.setItem('asc_community_v3', JSON.stringify(community)); }

// --- RENDER DISCOGRAFIA ---
const grid = $('#discoGrid');
const searchInput = $('#searchDisco');
const eraFilter = $('#filterEra');

function renderDisco(){
  const q = (searchInput.value||'').toLowerCase();
  const era = eraFilter.value;
  const filtered = discography.filter(a=>{
    const matchQ = !q || a.title.toLowerCase().includes(q) || a.tracks.some(t=>t.toLowerCase().includes(q));
    const matchEra = era==='all' || a.era===era;
    return matchQ && matchEra;
  });
  grid.innerHTML = filtered.map(album=>{
    const count = countPlaylistsForAlbum(album);
    return `<article class="disco-card" data-id="${album.id}">
      <div class="disco-cover" style="background:linear-gradient(135deg, ${album.color}, ${album.color}cc)"><span class="badge">${album.type}</span>${album.title[0]}</div>
      <div class="disco-info"><strong>${album.title}</strong><small>${album.year} • ${album.tracks.length} canciones • En ${count} playlists</small><div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap">${album.tracks.slice(0,3).map(t=>`<span class="playlist-tag">${t}</span>`).join('')}${album.tracks.length>3?'<span class="playlist-tag">+'+(album.tracks.length-3)+'</span>':''}</div></div>
    </article>`;
  }).join('');
  grid.querySelectorAll('.disco-card').forEach(c=>c.addEventListener('click', ()=>openDiscoModal(c.dataset.id)));
}
function countPlaylistsForAlbum(album){
  const all = [...official, ...community];
  return all.filter(p=> p.tracks?.some(t=> album.tracks.includes(t) || album.title.toLowerCase().includes(t.toLowerCase())) ).length;
}
function countPlaylistsForTrack(track){
  const all=[...official, ...community];
  return all.filter(p=> p.tracks?.includes(track));
}

searchInput.addEventListener('input', renderDisco);
eraFilter.addEventListener('change', renderDisco);
renderDisco();

// --- MODAL DISCO ---
const modal=$('#discoModal');
const modalContent=$('#discoModalContent');
function openDiscoModal(id){
  const album=discography.find(a=>a.id===id);
  if(!album) return;
  const allPlaylists=[...official.map(p=>({...p, source:'Oficial'})), ...community.map(p=>({...p, source:'ARMY'}))];
  modalContent.innerHTML = `
    <div style="display:flex;gap:16px;align-items:center"><div class="disco-cover" style="width:90px;height:90px;border-radius:18px;background:${album.color}">${album.title[0]}</div><div><p class="eyebrow">${album.type} • ${album.year}</p><h2 style="margin:0">${album.title}</h2><small>${album.tracks.length} canciones</small></div></div>
    <div class="track-list-modal">${album.tracks.map(track=>{
      const inPlaylists = countPlaylistsForTrack(track);
      return `<div class="track-row"><div><b>${track}</b><small>${inPlaylists.length===0?'Aún no agregada a playlists':'En '+inPlaylists.length+' playlists'}</small><div style="margin-top:6px">${inPlaylists.map(pl=>`<span class="playlist-tag" style="cursor:pointer" onclick="window.open('${pl.url}','_blank')">${pl.source}: ${pl.name} →</span>`).join('')}${inPlaylists.length===0?'<span class="notice" style="padding:4px 8px">¡Sé la primera en agregarla! Ve a Biblioteca ARMY</span>':''}</div></div><span style="font-size:18px">${inPlaylists.length>0?'♡':'＋'}</span></div>`;
    }).join('')}</div>
    <div class="notice" style="margin-top:14px">Tip: Si una canción no aparece en ninguna playlist, créala en Biblioteca ARMY y todas las ARMYs la verán aquí automáticamente ♡</div>
  `;
  modal.classList.remove('hidden');
}
$('#closeDisco').addEventListener('click', ()=>modal.classList.add('hidden'));
modal.addEventListener('click', e=>{ if(e.target===modal) modal.classList.add('hidden'); });

// --- NAV ---
$$('[data-view]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const v=btn.dataset.view;
    $$('.view').forEach(x=>x.classList.remove('active'));
    document.getElementById(v)?.classList.add('active');
    $$('.nav-link, .mobile-nav button').forEach(b=>b.classList.toggle('active', b.dataset.view===v));
  });
});
$$('[data-go]').forEach(b=>b.addEventListener('click', ()=>{ document.querySelector(`[data-view="${b.dataset.go}"]`)?.click(); }));

// --- AUTH SIMPLE ---
let currentUser=JSON.parse(localStorage.getItem('army_user')||'null');
const authModal=$('#authModal');
function updateAuth(){ const badge=$('#userBadge'); if(currentUser){ badge.textContent='♡ '+currentUser.username; badge.classList.remove('hidden'); $('#authBtn').classList.add('hidden'); $('#logoutBtn').classList.remove('hidden'); } else { badge.classList.add('hidden'); $('#authBtn').classList.remove('hidden'); $('#logoutBtn').classList.add('hidden'); } }
updateAuth();
$('#authBtn').addEventListener('click', ()=>authModal.classList.remove('hidden'));
$('#closeModal').addEventListener('click', ()=>authModal.classList.add('hidden'));
$('#loginForm').addEventListener('submit', e=>{ e.preventDefault(); const fd=new FormData(e.target); const u=fd.get('username'); currentUser={username:u}; localStorage.setItem('army_user', JSON.stringify(currentUser)); authModal.classList.add('hidden'); updateAuth(); });
$('#logoutBtn').addEventListener('click', ()=>{ localStorage.removeItem('army_user'); currentUser=null; updateAuth(); });

// --- LISTAS ---
function renderLists(){
  $('#officialList').innerHTML = official.map(p=>`<article class="playlist-card"><strong>${p.name}</strong><small>${p.duration} min • ${p.tracks.join(', ')}</small><div style="margin-top:8px"><a href="${p.url}" target="_blank" class="pill">Abrir Spotify →</a></div></article>`).join('');
  $('#communityList').innerHTML = community.length? community.map(p=>`<article class="playlist-card"><strong>${p.name}</strong><small>${p.duration} min</small></article>`).join('') : '<p class="notice">Aún no hay aportes ARMY. ¡Comparte la primera!</p>';
}
renderLists();

// --- COMBOS SIMPLE ---
$('#calculateButton').addEventListener('click', ()=>{
  const source=$('#comboSource').value;
  const pool = source==='official' ? official : (community.length?community:official);
  const html = pool.map((p,i)=>`<article class="playlist-card"><strong>Combo #${i+1} - ${p.duration} min</strong><small>${p.tracks.join(' • ')}</small><div style="margin-top:8px"><a class="pill" href="${p.url}" target="_blank">Abrir →</a></div></article>`).join('');
  $('#comboResults').innerHTML = html || '<p class="notice">No hay playlists en esa biblioteca</p>';
});
